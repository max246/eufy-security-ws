import {
  AudioCodec,
  CommandResult,
  CommandType,
  Device,
  ErrorCode,
  ParamType,
  PropertyValue,
  Station,
  StreamMetadata,
  VideoCodec,
  TalkbackStream,
  Schedule,
  Picture,
} from "eufy-security-client";
import { Readable } from "stream";
import { ILogObj, Logger } from "tslog";

import { JSONValue, OutgoingEvent } from "./outgoing_message.js";
import { dumpStation } from "./station/state.js";
import { StationEvent } from "./station/event.js";
import { dumpDevice } from "./device/state.js";
import { DeviceEvent } from "./device/event.js";
import { DriverEvent } from "./driver/event.js";
import { Client, ClientsController } from "./server.js";
import { StationCommand } from "./station/command.js";
import { DeviceCommand } from "./device/command.js";
import {
  maxSchemaVersion as internalSchemaVersion,
  schemaDeviceForwardTopic,
  schemaStationForwardTopic,
} from "./const.js";
import { DeviceMessageHandler } from "./device/message_handler.js";
import { DriverMessageHandler } from "./driver/message_handler.js";
import { convertCamelCaseToSnakeCase } from "./utils.js";

export class EventForwarder {
  constructor(
    private clients: ClientsController,
    private logger: Logger<ILogObj>
  ) {}

  public start(): void {
    this.clients.driver.on("tfa request", () => {
      DriverMessageHandler.tfa = true;
      this.forwardEvent(
        {
          source: "driver",
          event: DriverEvent.verifyCode,
        },
        0
      );
    });

    this.clients.driver.on("captcha request", (id: string, captcha: string) => {
      DriverMessageHandler.captchaId = id;
      DriverMessageHandler.captcha = captcha;
      this.forwardEvent(
        {
          source: "driver",
          event: DriverEvent.captchaRequest,
          captchaId: id,
          captcha: captcha,
        },
        7
      );
    });

    this.clients.driver.on("connect", () => {
      this.clients.clients.forEach((client) =>
        this.sendEvent(client, {
          source: "driver",
          event: DriverEvent.connected,
        })
      );
    });

    this.clients.driver.on("close", () => {
      this.clients.clients.forEach((client) =>
        this.sendEvent(client, {
          source: "driver",
          event: DriverEvent.disconnected,
        })
      );
    });

    this.clients.driver.on("push connect", () => {
      this.clients.clients.forEach((client) =>
        this.sendEvent(client, {
          source: "driver",
          event: DriverEvent.pushConnected,
        })
      );
    });

    this.clients.driver.on("push close", () => {
      this.clients.clients.forEach((client) =>
        this.sendEvent(client, {
          source: "driver",
          event: DriverEvent.pushDisconnected,
        })
      );
    });

    this.clients.driver.on("mqtt connect", () => {
      this.clients.clients.forEach((client) =>
        this.sendEvent(client, {
          source: "driver",
          event: DriverEvent.mqttConnected,
        })
      );
    });

    this.clients.driver.on("mqtt close", () => {
      this.clients.clients.forEach((client) =>
        this.sendEvent(client, {
          source: "driver",
          event: DriverEvent.mqttDisconnected,
        })
      );
    });

    this.clients.driver.on("connection error", (error: Error) => {
      this.forwardEvent(
        {
          source: "driver",
          event: DriverEvent.connectionError,
          error: error,
        },
        14
      );
    });

    this.clients.driver.on("station removed", (station: Station) => {
      this.clients.clients.forEach((client) => {
        if (client.schemaVersion <= 12) {
          this.sendEvent(client, {
            source: "station",
            event: StationEvent.stationRemoved,
            station: dumpStation(station, client.schemaVersion) as JSONValue,
          });
        } else {
          this.sendEvent(client, {
            source: "station",
            event: StationEvent.stationRemoved,
            station: station.getSerial(),
          });
        }
      });
    });

    this.clients.driver.on("device removed", (device: Device) => {
      this.clients.clients.forEach((client) => {
        if (client.schemaVersion <= 12) {
          this.sendEvent(client, {
            source: "device",
            event: DeviceEvent.deviceRemoved,
            device: dumpDevice(device, client.schemaVersion) as JSONValue,
          });
        } else {
          this.sendEvent(client, {
            source: "device",
            event: DeviceEvent.deviceRemoved,
            device: device.getSerial(),
          });
        }
      });
    });

    this.clients.driver
      .getStations()
      .then((stations: Station[]) => {
        stations.forEach((station) => {
          this.setupStation(station);
        });
      })
      .catch()
      .finally(() => {
        this.clients.driver.on("station added", (station: Station) => {
          this.clients.clients.forEach((client) => {
            if (client.schemaVersion <= 12) {
              this.sendEvent(client, {
                source: "station",
                event: StationEvent.stationAdded,
                station: dumpStation(station, client.schemaVersion) as JSONValue,
              });
            } else {
              this.sendEvent(client, {
                source: "station",
                event: StationEvent.stationAdded,
                station: station.getSerial(),
              });
            }
          });
          this.setupStation(station);
        });
      });

    this.clients.driver
      .getDevices()
      .then((devices: Device[]) => {
        devices.forEach((device) => {
          this.setupDevice(device);
        });
      })
      .catch()
      .finally(() => {
        this.clients.driver.on("device added", (device: Device) => {
          this.clients.clients.forEach((client) => {
            if (client.schemaVersion <= 12) {
              this.sendEvent(client, {
                source: "device",
                event: DeviceEvent.deviceAdded,
                device: dumpDevice(device, client.schemaVersion) as JSONValue,
              });
            } else {
              this.sendEvent(client, {
                source: "device",
                event: DeviceEvent.deviceAdded,
                device: device.getSerial(),
              });
            }
          });
          this.setupDevice(device);
        });
      });

    this.clients.driver.on(
      "station livestream start",
      (station: Station, device: Device, metadata: StreamMetadata, videostream: Readable, audiostream: Readable) => {
        const serialNumber = device.getSerial();
        this.clients.clients
          .filter((cl) => cl.receiveLivestream[serialNumber] && cl.isConnected)
          .forEach((client) => {
            if (client.schemaVersion >= 2) {
              client.sendEvent({
                source: "device",
                event: DeviceEvent.livestreamStarted,
                serialNumber: serialNumber,
              });
            }
          });
        videostream.on("data", (chunk: Buffer) => {
          this.clients.clients
            .filter((cl) => cl.receiveLivestream[serialNumber] && cl.isConnected)
            .forEach((client) => {
              if (client.schemaVersion >= 2) {
                client.sendEvent({
                  source: "device",
                  event: DeviceEvent.livestreamVideoData,
                  serialNumber: serialNumber,
                  buffer: chunk as unknown as JSONValue,
                  metadata: {
                    videoCodec: VideoCodec[metadata.videoCodec],
                    videoFPS: metadata.videoFPS,
                    videoHeight: metadata.videoHeight,
                    videoWidth: metadata.videoWidth,
                  },
                });
              }
            });
        });
        audiostream.on("data", (chunk: Buffer) => {
          this.clients.clients
            .filter((cl) => cl.receiveLivestream[serialNumber] && cl.isConnected)
            .forEach((client) => {
              if (client.schemaVersion >= 2) {
                client.sendEvent({
                  source: "device",
                  event: DeviceEvent.livestreamAudioData,
                  serialNumber: serialNumber,
                  buffer: chunk as unknown as JSONValue,
                  metadata: {
                    audioCodec: AudioCodec[metadata.audioCodec],
                  },
                });
              }
            });
        });
      }
    );

    this.clients.driver.on("station livestream stop", (station: Station, device: Device) => {
      const serialNumber = device.getSerial();
      this.clients.clients
        .filter((cl) => cl.receiveLivestream[serialNumber] && cl.isConnected)
        .forEach((client) => {
          if (client.schemaVersion >= 2) {
            client.sendEvent({
              source: "device",
              event: DeviceEvent.livestreamStopped,
              serialNumber: serialNumber,
            });
          }
          client.receiveLivestream[serialNumber] = false;
          DeviceMessageHandler.removeStreamingDevice(station.getSerial(), client);
        });
    });

    this.clients.driver.on(
      "station download start",
      (station: Station, device: Device, metadata: StreamMetadata, videostream: Readable, audiostream: Readable) => {
        const serialNumber = device.getSerial();
        this.clients.clients
          .filter((cl) => cl.receiveDownloadStream[serialNumber] && cl.isConnected)
          .forEach((client) => {
            if (client.schemaVersion >= 3) {
              client.sendEvent({
                source: "device",
                event: DeviceEvent.downloadStarted,
                serialNumber: serialNumber,
              });
            }
          });
        videostream.on("data", (chunk: Buffer) => {
          this.clients.clients
            .filter((cl) => cl.receiveDownloadStream[serialNumber] && cl.isConnected)
            .forEach((client) => {
              if (client.schemaVersion >= 3) {
                client.sendEvent({
                  source: "device",
                  event: DeviceEvent.downloadVideoData,
                  serialNumber: serialNumber,
                  buffer: chunk as unknown as JSONValue,
                  metadata: {
                    videoCodec: VideoCodec[metadata.videoCodec],
                    videoFPS: metadata.videoFPS,
                    videoHeight: metadata.videoHeight,
                    videoWidth: metadata.videoWidth,
                  },
                });
              }
            });
        });
        audiostream.on("data", (chunk: Buffer) => {
          this.clients.clients
            .filter((cl) => cl.receiveDownloadStream[serialNumber] && cl.isConnected)
            .forEach((client) => {
              if (client.schemaVersion >= 3) {
                client.sendEvent({
                  source: "device",
                  event: DeviceEvent.downloadAudioData,
                  serialNumber: serialNumber,
                  buffer: chunk as unknown as JSONValue,
                  metadata: {
                    audioCodec: AudioCodec[metadata.audioCodec],
                  },
                });
              }
            });
        });
      }
    );

    this.clients.driver.on("station download finish", (station: Station, device: Device) => {
      const serialNumber = device.getSerial();
      this.clients.clients
        .filter((cl) => cl.receiveDownloadStream[serialNumber] && cl.isConnected)
        .forEach((client) => {
          if (client.schemaVersion >= 3) {
            client.sendEvent({
              source: "device",
              event: DeviceEvent.downloadFinished,
              serialNumber: serialNumber,
            });
          }
          client.receiveDownloadStream[serialNumber] = false;
          DeviceMessageHandler.removeDownloadingDevice(station.getSerial(), client);
        });
    });

    this.clients.driver.on("station rtsp livestream start", (station: Station, device: Device) => {
      const serialNumber = device.getSerial();
      this.clients.clients
        .filter((cl) => cl.isConnected)
        .forEach((client) => {
          if (client.schemaVersion >= 6) {
            client.sendEvent({
              source: "device",
              event: DeviceEvent.rtspLivestreamStarted,
              serialNumber: serialNumber,
            });
          }
        });
    });

    this.clients.driver.on("station rtsp livestream stop", (station: Station, device: Device) => {
      const serialNumber = device.getSerial();
      this.clients.clients
        .filter((cl) => cl.isConnected)
        .forEach((client) => {
          if (client.schemaVersion >= 6) {
            client.sendEvent({
              source: "device",
              event: DeviceEvent.rtspLivestreamStopped,
              serialNumber: serialNumber,
            });
          }
        });
    });

    this.clients.driver.on("user added", (device: Device, username: string, schedule?: Schedule) => {
      this.forwardEvent(
        {
          source: "device",
          event: DeviceEvent.userAdded,
          serialNumber: device.getSerial(),
          username: username,
          schedule: schedule,
        },
        13
      );
    });

    this.clients.driver.on("user deleted", (device: Device, username: string) => {
      this.forwardEvent(
        {
          source: "device",
          event: DeviceEvent.userDeleted,
          serialNumber: device.getSerial(),
          username: username,
        },
        13
      );
    });

    this.clients.driver.on("user error", (device: Device, username: string, error: Error) => {
      this.forwardEvent(
        {
          source: "device",
          event: DeviceEvent.userError,
          serialNumber: device.getSerial(),
          username: username,
          error: error,
        },
        13
      );
    });

    this.clients.driver.on("user username updated", (device: Device, username: string) => {
      this.forwardEvent(
        {
          source: "device",
          event: DeviceEvent.userUsernameUpdated,
          serialNumber: device.getSerial(),
          username: username,
        },
        13
      );
    });

    this.clients.driver.on("user schedule updated", (device: Device, username: string, schedule: Schedule) => {
      this.forwardEvent(
        {
          source: "device",
          event: DeviceEvent.userScheduleUpdated,
          serialNumber: device.getSerial(),
          username: username,
          schedule: schedule,
        },
        13
      );
    });

    this.clients.driver.on("user passcode updated", (device: Device, username: string) => {
      this.forwardEvent(
        {
          source: "device",
          event: DeviceEvent.userPasscodeUpdated,
          serialNumber: device.getSerial(),
          username: username,
        },
        13
      );
    });

    this.clients.driver.on(
      "station talkback start",
      (station: Station, device: Device, talkbackStream: TalkbackStream) => {
        const serialNumber = device.getSerial();
        this.clients.clients
          .filter((cl) => cl.sendTalkbackStream[serialNumber] === true && cl.isConnected)
          .forEach((client) => {
            if (client.schemaVersion >= 13) {
              client.sendEvent({
                source: "device",
                event: DeviceEvent.talkbackStarted,
                serialNumber: serialNumber,
              });
            }
          });
        DeviceMessageHandler.talkbackStream = talkbackStream;
      }
    );

    this.clients.driver.on("station talkback stop", (station: Station, device: Device) => {
      const serialNumber = device.getSerial();
      this.clients.clients
        .filter((cl) => cl.sendTalkbackStream[serialNumber] && cl.isConnected)
        .forEach((client) => {
          if (client.schemaVersion >= 13) {
            client.sendEvent({
              source: "device",
              event: DeviceEvent.talkbackStopped,
              serialNumber: serialNumber,
            });
          }
          client.sendTalkbackStream[serialNumber] = false;
          DeviceMessageHandler.removeTalkbackingDevice(station.getSerial(), client);
        });
    });

    this.clients.driver.on("station image download", (station: Station, file: string, image: Picture) => {
      this.forwardEvent(
        {
          source: "station",
          event: StationEvent.imageDownloaded,
          serialNumber: station.getSerial(),
          file: file,
          image: image,
        },
        17
      );
    });
  }

  private forwardEvent(
    data: OutgoingEvent,
    minSchemaVersion: number,
    maxSchemaVersion: number = internalSchemaVersion
  ): void {
    // Forward event to all connected clients
    this.clients.clients.forEach((client) => {
      if (client.schemaVersion >= minSchemaVersion && client.schemaVersion <= maxSchemaVersion) {
        this.sendEvent(client, data);
      }
    });
  }

  private sendEvent(client: Client, data: OutgoingEvent): void {
    // Send event to connected client only
    if (client.receiveEvents && client.isConnected) {
      client.sendEvent(data);
    }
  }

  private setupStation(station: Station): void {
    for (const { name, src, event, minSchemaVersion, map } of schemaStationForwardTopic) {
      // Attach the listen and allow any args to be added
      station.on(name, (...args: any[]) => {
        const [item, ...rest] = args;

        this.forwardEvent(
          {
            source: src,
            event: event,
            serialNumber: station.getSerial(), //it can be a device or station
            // Cast 'args' as a tuple of [any, ...any[]] to satisfy the spread requirement
            ...(map ? map(...(args as [any, ...any[]])) : {}),
          },
          minSchemaVersion
        );
      });
    }

    station.on("guard mode", (station: Station, guardMode: number) => {
      // Event for schemaVersion <= 2
      this.forwardEvent(
        {
          source: "station",
          event: StationEvent.guardModeChanged,
          serialNumber: station.getSerial(),
          guardMode: guardMode,
          currentMode: station.getCurrentMode() as number,
        },
        0,
        2
      );
      // Event for schemaVersion >= 3
      this.forwardEvent(
        {
          source: "station",
          event: StationEvent.guardModeChanged,
          serialNumber: station.getSerial(),
          guardMode: guardMode,
        },
        3
      );
    });

    station.on("current mode", (station: Station, currentMode: number) => {
      // Event for schemaVersion <= 2
      this.forwardEvent(
        {
          source: "station",
          event: StationEvent.guardModeChanged,
          serialNumber: station.getSerial(),
          guardMode: station.getGuardMode() as number,
          currentMode: currentMode,
        },
        0,
        2
      );
      //Event for schemaVersion >= 3
      this.forwardEvent(
        {
          source: "station",
          event: StationEvent.currentModeChanged,
          serialNumber: station.getSerial(),
          currentMode: currentMode,
        },
        3
      );
    });

    station.on("rtsp url", (station: Station, channel: number, value: string) => {
      console.log("yes");
      this.clients.driver
        .getStationDevice(station.getSerial(), channel)
        .then((device: Device) => {
          console.log("FUCKKK", value, device.getSerial());
          this.forwardEvent(
            {
              source: "device",
              event: DeviceEvent.gotRtspUrl,
              serialNumber: device.getSerial(),
              rtspUrl: value,
            },
            0
          );
        })
        .catch();
    });

    station.on("command result", (station: Station, result: CommandResult) => {
      if (result.channel === Station.CHANNEL || result.channel === Station.CHANNEL_INDOOR) {
        //Station command result
        let command: string | undefined = undefined;
        switch (result.command_type) {
          case CommandType.CMD_HUB_REBOOT:
            command = StationCommand.reboot;
            break;
          case CommandType.CMD_SET_ARMING:
            command = StationCommand.setGuardMode;
            break;
          case CommandType.CMD_SET_TONE_FILE:
            command = StationCommand.triggerAlarm;
            break;
        }
        if (command !== undefined) {
          this.forwardEvent(
            {
              source: "station",
              event: StationEvent.commandResult,
              serialNumber: station.getSerial(),
              command: command.split(".")[1],
              returnCode: result.return_code,
              returnCodeName: ErrorCode[result.return_code] !== undefined ? ErrorCode[result.return_code] : "UNKNOWN",
            },
            0,
            12
          );
        }
        if (result.customData !== undefined) {
          if (result.customData.property !== undefined) {
            this.forwardEvent(
              {
                source: "station",
                event: StationEvent.commandResult,
                serialNumber: station.getSerial(),
                command: "set_property",
                returnCode: result.return_code,
                returnCodeName: ErrorCode[result.return_code] !== undefined ? ErrorCode[result.return_code] : "UNKNOWN",
                customData: result.customData,
              },
              13
            );
          } else if (result.customData.command !== undefined && result.customData.command.name.startsWith("station")) {
            const command = result.customData.command.name;
            this.forwardEvent(
              {
                source: "station",
                event: StationEvent.commandResult,
                serialNumber: station.getSerial(),
                command: convertCamelCaseToSnakeCase(command.replace("station", "")),
                returnCode: result.return_code,
                returnCodeName: ErrorCode[result.return_code] !== undefined ? ErrorCode[result.return_code] : "UNKNOWN",
                customData: result.customData,
              },
              13
            );
          }
        }
      } else {
        // Device command result
        let command: string | undefined = undefined;
        switch (result.command_type as number) {
          case CommandType.CMD_DEVS_SWITCH:
            command = DeviceCommand.enableDevice;
            break;
          case CommandType.CMD_DOORLOCK_DATA_PASS_THROUGH:
            command = DeviceCommand.lockDevice;
            break;
          case CommandType.CMD_EAS_SWITCH:
            command = DeviceCommand.setAntiTheftDetection;
            break;
          case CommandType.CMD_IRCUT_SWITCH:
            command = DeviceCommand.setAutoNightVision;
            break;
          case CommandType.CMD_PIR_SWITCH:
          case CommandType.CMD_INDOOR_DET_SET_MOTION_DETECT_ENABLE:
          case ParamType.COMMAND_MOTION_DETECTION_PACKAGE:
            command = DeviceCommand.setMotionDetection;
            break;
          case CommandType.CMD_INDOOR_DET_SET_PET_ENABLE:
            command = DeviceCommand.setPetDetection;
            break;
          case CommandType.CMD_NAS_SWITCH:
            command = DeviceCommand.setRTSPStream;
            break;
          case CommandType.CMD_INDOOR_DET_SET_SOUND_DETECT_ENABLE:
            command = DeviceCommand.setSoundDetection;
            break;
          case CommandType.CMD_DEV_LED_SWITCH:
          case CommandType.CMD_INDOOR_LED_SWITCH:
          case CommandType.CMD_BAT_DOORBELL_SET_LED_ENABLE:
          case ParamType.COMMAND_LED_NIGHT_OPEN:
            command = DeviceCommand.setStatusLed;
            break;
          case CommandType.CMD_SET_DEVS_OSD:
            command = DeviceCommand.setWatermark;
            break;
          case CommandType.CMD_INDOOR_ROTATE:
            command = DeviceCommand.panAndTilt;
            break;
          case CommandType.CMD_INDOOR_PAN_CALIBRATION:
            command = DeviceCommand.calibrate;
            break;
          case CommandType.CMD_SET_DEVS_TONE_FILE:
            command = DeviceCommand.triggerAlarm;
            break;
          case CommandType.CMD_DOWNLOAD_VIDEO:
            command = DeviceCommand.startDownload;
            break;
          case CommandType.CMD_DOWNLOAD_CANCEL:
            command = DeviceCommand.cancelDownload;
            break;
          case CommandType.CMD_START_REALTIME_MEDIA:
          case ParamType.COMMAND_START_LIVESTREAM:
            command = DeviceCommand.startLivestream;
            break;
          case CommandType.CMD_STOP_REALTIME_MEDIA:
            command = DeviceCommand.stopLivestream;
            break;
          case CommandType.CMD_BAT_DOORBELL_QUICK_RESPONSE:
            //case 1004: //TODO: CMD_STOP_REALTIME_MEDIA has the same number
            command = DeviceCommand.quickResponse;
            break;
        }
        if (command !== undefined) {
          this.clients.driver
            .getStationDevice(station.getSerial(), result.channel)
            .then((device: Device) => {
              this.forwardEvent(
                {
                  source: "device",
                  event: DeviceEvent.commandResult,
                  serialNumber: device.getSerial(),

                  command: command!.split(".")[1],
                  returnCode: result.return_code,
                  returnCodeName:
                    ErrorCode[result.return_code] !== undefined ? ErrorCode[result.return_code] : "UNKNOWN",
                },
                0,
                12
              );
            })
            .catch();
        }
        if (result.customData !== undefined) {
          if (result.customData.property !== undefined) {
            this.clients.driver
              .getStationDevice(station.getSerial(), result.channel)
              .then((device: Device) => {
                this.forwardEvent(
                  {
                    source: "device",
                    event: DeviceEvent.commandResult,
                    serialNumber: device.getSerial(),
                    command: "set_property",
                    returnCode: result.return_code,
                    returnCodeName:
                      ErrorCode[result.return_code] !== undefined ? ErrorCode[result.return_code] : "UNKNOWN",
                    customData: result.customData,
                  },
                  13
                );
              })
              .catch();
          } else if (result.customData.command !== undefined && result.customData.command.name.startsWith("device")) {
            const command = result.customData.command.name;
            this.clients.driver
              .getStationDevice(station.getSerial(), result.channel)
              .then((device: Device) => {
                this.forwardEvent(
                  {
                    source: "device",
                    event: DeviceEvent.commandResult,
                    serialNumber: device.getSerial(),
                    command: convertCamelCaseToSnakeCase(command.replace("device", "")),
                    returnCode: result.return_code,
                    returnCodeName:
                      ErrorCode[result.return_code] !== undefined ? ErrorCode[result.return_code] : "UNKNOWN",
                    customData: result.customData,
                  },
                  13
                );
              })
              .catch();
          }
        }
      }
    });

    station.on("property changed", (station: Station, name: string, value: PropertyValue, ready: boolean) => {
      if (ready && !name.startsWith("hidden-")) {
        this.forwardEvent(
          {
            source: "station",
            event: StationEvent.propertyChanged,
            serialNumber: station.getSerial(),
            name: name,
            value: value as JSONValue,
            timestamp: +new Date(),
          },
          0,
          9
        );
        this.forwardEvent(
          {
            source: "station",
            event: StationEvent.propertyChanged,
            serialNumber: station.getSerial(),
            name: name,
            value: value as JSONValue,
          },
          10
        );
      }
    });

    station.on("device pin verified", (deviceSN: string, successfull: boolean) => {
      this.forwardEvent(
        {
          source: "device",
          event: DeviceEvent.pinVerified,
          serialNumber: deviceSN,
          successfull: successfull,
        },
        13
      );
    });
  }

  private setupDevice(device: Device): void {
    for (const { name, src, event, minSchemaVersion, map } of schemaDeviceForwardTopic) {
      // Attach the listen and allow any args to be added
      device.on(name, (...args: any[]) => {
        const [item, ...rest] = args;

        this.forwardEvent(
          {
            source: src,
            event: event,
            serialNumber: item.getSerial(), //it can be a device or station
            // If map exists, use it. If not, default to the first extra arg as 'state'
            ...(map ? map(...(args as [any, ...any[]])) : { state: rest[0] }),
          },
          minSchemaVersion
        );
      });
    }

    device.on("property changed", (device: Device, name: string, value: PropertyValue, ready: boolean) => {
      if (ready && !name.startsWith("hidden-")) {
        this.forwardEvent(
          {
            source: "device",
            event: DeviceEvent.propertyChanged,
            serialNumber: device.getSerial(),
            name: name,
            value: value as JSONValue,
            timestamp: +new Date(),
          },
          0,
          9
        );
        this.forwardEvent(
          {
            source: "device",
            event: DeviceEvent.propertyChanged,
            serialNumber: device.getSerial(),
            name: name,
            value: value as JSONValue,
          },
          10
        );
      }
    });
  }
}
