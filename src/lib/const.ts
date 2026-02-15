import { DeviceEvent } from "./device/event.js";
import { StationEvent } from "./station/event.js";
import {
  AlarmEvent,
  DatabaseCountByDate,
  DatabaseQueryByDate,
  DatabaseQueryLatestInfo,
  DatabaseQueryLocal,
  DatabaseReturnCode,
  Device,
  DeviceEvents,
  SmartSafeAlarm911Event,
  SmartSafeShakeAlarmEvent,
  Station,
  StationEvents,
} from "eufy-security-client";
import { ForwardSource } from "./outgoing_message.js";

export const version = "1.9.9";

// minimal schema version the server supports
export const minSchemaVersion = 0;

// maximal/current schema version the server supports
export const maxSchemaVersion = 21;

// old version reference
export const oldSchemaVersion = 13;

export interface ForwardStationSchema<T = any, E = any> {
  name: keyof E;
  src: ForwardSource;
  event: StationEvent | DeviceEvent;
  minSchemaVersion: number;
  maxSchemaVersion?: number;
  /**
   * Optional mapper to format the payload.
   * @param emitter The Station instance
   * @param args The remaining arguments emitted by the event
   */
  map?: (emitter: T, ...args: any[]) => object;
}

export interface ForwardDeviceSchema<T = any, E = any> {
  name: keyof E;
  src: ForwardSource;
  event: DeviceEvent;
  minSchemaVersion: number;
  /**
   * Optional mapper to format the payload.
   * @param emitter The Device  instance
   * @param args The remaining arguments emitted by the event
   */
  map?: (emitter: T, ...args: any[]) => object;
}

export const schemaStationForwardTopic: ForwardStationSchema<Station, StationEvents>[] = [
  {
    name: "connect",
    src: "station",
    event: StationEvent.connected,
    minSchemaVersion: 0,
    map: (station: Station) => ({}),
  },
  {
    name: "close",
    src: "station",
    event: StationEvent.disconnected,
    minSchemaVersion: 0,
    map: () => ({}),
  },
  {
    name: "connection error",
    src: "station",
    event: StationEvent.connectionError,
    minSchemaVersion: 13,
    map: () => ({}),
  },
  {
    name: "alarm event",
    src: "station",
    event: StationEvent.alarmEvent,
    minSchemaVersion: 3,
    map: (station: Station, alarmEvent: AlarmEvent) => ({ alarmEvent }),
  },
  {
    name: "alarm delay event",
    src: "station",
    event: StationEvent.alarmDelayEvent,
    minSchemaVersion: 11,
    map: (st: Station, alarmDelayEvent: AlarmEvent, alarmDelay: number) => ({ alarmDelayEvent, alarmDelay }),
  },
  {
    name: "alarm armed event",
    src: "station",
    event: StationEvent.alarmArmedEvent,
    minSchemaVersion: 11,
    map: (st: Station) => ({}),
  },
  {
    name: "alarm arm delay event",
    src: "station",
    event: StationEvent.alarmArmDelayEvent,
    minSchemaVersion: 12,
    map: (st: Station, armDelay: number) => ({ armDelay }),
  },
  {
    name: "database query latest",
    src: "station",
    event: StationEvent.databaseQueryLatest,
    minSchemaVersion: 18,
    map: (station: Station, returnCode: DatabaseReturnCode, data: Array<DatabaseQueryLatestInfo>) => ({
      returnCode,
      data,
    }),
  },
  {
    name: "database query local",
    src: "station",
    event: StationEvent.databaseQueryLocal,
    minSchemaVersion: 18,
    map: (station: Station, returnCode: DatabaseReturnCode, data: Array<DatabaseQueryLocal>) => ({
      returnCode,
      data,
    }),
  },
  {
    name: "database query by date",
    src: "station",
    event: StationEvent.databaseQueryByDate,
    minSchemaVersion: 18,
    map: (station: Station, returnCode: DatabaseReturnCode, data: Array<DatabaseQueryByDate>) => ({
      returnCode,
      data,
    }),
  },
  {
    name: "database count by date",
    src: "station",
    event: StationEvent.databaseCountByDate,
    minSchemaVersion: 18,
    map: (station: Station, returnCode: DatabaseReturnCode, data: Array<DatabaseCountByDate>) => ({
      returnCode,
      data,
    }),
  },
  {
    name: "database delete",
    src: "station",
    event: StationEvent.databaseDelete,
    minSchemaVersion: 18,
    map: (station: Station, returnCode: DatabaseReturnCode, failedIds: Array<unknown>) => ({
      returnCode,
      failedIds,
    }),
  },
];

export const schemaDeviceForwardTopic: ForwardDeviceSchema<Device, DeviceEvents>[] = [
  {
    name: "motion detected",
    src: "device",
    event: DeviceEvent.motionDetected,
    minSchemaVersion: 0,
    map: (device: Device, state: boolean) => ({ state }),
  },
  {
    name: "person detected",
    src: "device",
    event: DeviceEvent.personDetected,
    minSchemaVersion: 0,
    map: (device: Device, state: boolean, person: string) => ({ state, person }),
  },
  {
    name: "crying detected",
    src: "device",
    event: DeviceEvent.cryingDetected,
    minSchemaVersion: 0,
    map: (device: Device, state: boolean) => ({ state }),
  },
  {
    name: "pet detected",
    src: "device",
    event: DeviceEvent.petDetected,
    minSchemaVersion: 0,
    map: (device: Device, state: boolean) => ({ state }),
  },
  {
    name: "vehicle detected",
    src: "device",
    event: DeviceEvent.vehicleDetected,
    minSchemaVersion: 14,
    map: (device: Device, state: boolean) => ({ state }),
  },
  {
    name: "sound detected",
    src: "device",
    event: DeviceEvent.soundDetected,
    minSchemaVersion: 0,
    map: (device: Device, state: boolean) => ({ state }),
  },
  {
    name: "rings",
    src: "device",
    event: DeviceEvent.rings,
    minSchemaVersion: 0,
    map: (device: Device, state: boolean) => ({ state }),
  },
  {
    name: "package delivered",
    src: "device",
    event: DeviceEvent.packageDelivered,
    minSchemaVersion: 13,
    map: (device: Device, state: boolean) => ({ state }),
  },
  {
    name: "package stranded",
    src: "device",
    event: DeviceEvent.packageStranded,
    minSchemaVersion: 13,
    map: (device: Device, state: boolean) => ({ state }),
  },
  {
    name: "package taken",
    src: "device",
    event: DeviceEvent.packageTaken,
    minSchemaVersion: 13,
    map: (device: Device, state: boolean) => ({ state }),
  },
  {
    name: "someone loitering",
    src: "device",
    event: DeviceEvent.someoneLoitering,
    minSchemaVersion: 13,
    map: (device: Device, state: boolean) => ({ state }),
  },
  {
    name: "radar motion detected",
    src: "device",
    event: DeviceEvent.radarMotionDetected,
    minSchemaVersion: 13,
    map: (device: Device, state: boolean) => ({ state }),
  },
  {
    name: "open",
    src: "device",
    event: DeviceEvent.sensorOpen,
    minSchemaVersion: 0,
    map: (device: Device, state: boolean) => ({ state }),
  },
  {
    name: "911 alarm",
    src: "device",
    event: DeviceEvent.alarm911,
    minSchemaVersion: 13,
    map: (device: Device, state: boolean, detail: SmartSafeAlarm911Event) => ({ state, detail }),
  },
  {
    name: "shake alarm",
    src: "device",
    event: DeviceEvent.shakeAlarm,
    minSchemaVersion: 13,
    map: (device: Device, state: boolean, detail: SmartSafeShakeAlarmEvent) => ({ state, detail }),
  },
  {
    name: "wrong try-protect alarm",
    src: "device",
    event: DeviceEvent.wrongTryProtectAlarm,
    minSchemaVersion: 13,
    map: (device: Device, state: boolean) => ({ state }),
  },
  {
    name: "long time not close",
    src: "device",
    event: DeviceEvent.LongTimeNotClose,
    minSchemaVersion: 13,
    map: (device: Device, state: boolean) => ({ state }),
  },
  {
    name: "jammed",
    src: "device",
    event: DeviceEvent.jammed,
    minSchemaVersion: 13,
    map: (device: Device, state: boolean) => ({ state }),
  },
  {
    name: "low battery",
    src: "device",
    event: DeviceEvent.lowBattery,
    minSchemaVersion: 13,
    map: (device: Device, state: boolean) => ({ state }),
  },
  {
    name: "locked",
    src: "device",
    event: DeviceEvent.locked,
    minSchemaVersion: 0,
    map: (device: Device, state: boolean) => ({ state }),
  },
  {
    name: "stranger person detected",
    src: "device",
    event: DeviceEvent.strangerPersonDetected,
    minSchemaVersion: 15,
    map: (device: Device, state: boolean) => ({ state }),
  },
  {
    name: "dog detected",
    src: "device",
    event: DeviceEvent.dogDetected,
    minSchemaVersion: 15,
    map: (device: Device, state: boolean) => ({ state }),
  },
  {
    name: "dog lick detected",
    src: "device",
    event: DeviceEvent.dogLickDetected,
    minSchemaVersion: 15,
    map: (device: Device, state: boolean) => ({ state }),
  },
  {
    name: "dog poop detected",
    src: "device",
    event: DeviceEvent.dogPoopDetected,
    minSchemaVersion: 15,
    map: (device: Device, state: boolean) => ({ state }),
  },
  {
    name: "open",
    src: "device",
    event: DeviceEvent.open,
    minSchemaVersion: 21,
    map: (device: Device, state: boolean) => ({ state }),
  },
  {
    name: "tampering",
    src: "device",
    event: DeviceEvent.tampering,
    minSchemaVersion: 21,
    map: (device: Device, state: boolean) => ({ state }),
  },
  {
    name: "low temperature",
    src: "device",
    event: DeviceEvent.lowTemperature,
    minSchemaVersion: 21,
    map: (device: Device, state: boolean) => ({ state }),
  },
  {
    name: "high temperature",
    src: "device",
    event: DeviceEvent.highTemperature,
    minSchemaVersion: 21,
    map: (device: Device, state: boolean) => ({ state }),
  },
  {
    name: "pin incorrect",
    src: "device",
    event: DeviceEvent.pinIncorrect,
    minSchemaVersion: 21,
    map: (device: Device, state: boolean) => ({ state }),
  },
  {
    name: "lid stuck",
    src: "device",
    event: DeviceEvent.lidStuck,
    minSchemaVersion: 21,
    map: (device: Device, state: boolean) => ({ state }),
  },
  {
    name: "battery fully charged",
    src: "device",
    event: DeviceEvent.batteryFullyCharged,
    minSchemaVersion: 21,
    map: (device: Device, state: boolean) => ({ state }),
  },
];
