import {jest} from "@jest/globals";
import {EventForwarder} from "../forward.js";
import {DeviceEvent} from "../device/event.js";
import {before} from "node:test";
import {DriverMessageHandler} from "../driver/message_handler.js";
import {EventEmitter} from "events";
import {
    AlarmEvent, CommandResult, DatabaseCountByDate, DatabaseQueryByDate, DatabaseQueryLatestInfo, DatabaseQueryLocal,
    DatabaseReturnCode,
    Device, ErrorCode, PropertyValue,
    SmartSafeAlarm911Event,
    SmartSafeShakeAlarmEvent,
    Station
} from "eufy-security-client";
import {StationEvent} from "../station/event.js";
import {DeviceType, MicStatus, TriggerType, VideoType} from "eufy-security-client/build/http/types.js";
import {CommandType, P2PStorageType} from "eufy-security-client/build/p2p/types.js";
import {CustomData} from "eufy-security-client/build/p2p/models.js"; // Adjust path to your enums
//
// describe("Device Event Forwarding", () => {
//     let mockDevice: any;
//     let mockStation: any;
//     let mockClients: any;
//     let mockLogger: any;
//     let forwarder: EventForwarder;
//
//     before(() => {
//
//         // 1. Create a mock station that behaves like an EventEmitter
//         // We can use a real EventEmitter for simplicity in testing
//         const {EventEmitter} = require("events");
//         mockStation = new EventEmitter();
//         mockDevice = new EventEmitter();
//         mockDevice.getSerial = jest.fn().mockReturnValue("DEVICE_12345");
//
//         const mockDriver = new EventEmitter();
//         (mockDriver as any).getDevices = jest.fn<() => Promise<Device[]>>().mockResolvedValue([mockDevice]);
//         (mockDriver as any).getStations = jest.fn<() => Promise<Station[]>>().mockResolvedValue([mockStation]);
//
//         // 2. Mock your class EventForwarder and the forwardEvent method
//         // Replace 'YourClassName' with the actual name of your class
//         mockClients = {
//             driver: mockDriver
//         }; // Add methods if forwardEvent calls them
//         mockLogger = {
//             info: jest.fn(),
//             error: jest.fn(),
//             debug: jest.fn(),
//         };
//         forwarder = new EventForwarder(mockClients, mockLogger);
//         jest.spyOn(forwarder, "forwardEvent" as any).mockImplementation(() => {
//         });
//
//         // 3. Register the listeners (call the method that sets up the .on() loops)
//         forwarder.start();
//     });
//
//     afterEach(() => {
//         DriverMessageHandler.tfa = false;
//     });
//
//     it("test forward: motion detected", () => {
//         const state = true;
//
//         // 4. Emit the event from the mock station
//         mockDevice.emit("motion detected", mockDevice, state);
//
//         // // 5. Assert forwardEvent was called correctly
//         expect((forwarder as any).forwardEvent).toHaveBeenCalledWith(
//             {
//                 source: "device",
//                 event: DeviceEvent.motionDetected,
//                 serialNumber: "DEVICE_12345",
//                 state: true,
//             },
//             0 // The specific schema version you requested
//         );
//     });
//
//     it("test forward: person detected", () => {
//         const state = true;
//         const person = "a person"
//
//         // 4. Emit the event from the mock device
//         mockDevice.emit("person detected", mockDevice, state, person);
//
//         // // 5. Assert forwardEvent was called correctly
//         expect((forwarder as any).forwardEvent).toHaveBeenCalledWith(
//             {
//                 source: "device",
//                 event: DeviceEvent.personDetected,
//                 serialNumber: "DEVICE_12345",
//                 state: true,
//                 person: "a person"
//             },
//             0 // The specific schema version you requested
//         );
//     });
//
//     it("test forward: crying detected", () => {
//         const state = true;
//
//         // 4. Emit the event from the mock device
//         mockDevice.emit("crying detected", mockDevice, state);
//
//         // // 5. Assert forwardEvent was called correctly
//         expect((forwarder as any).forwardEvent).toHaveBeenCalledWith(
//             {
//                 source: "device",
//                 event: DeviceEvent.cryingDetected,
//                 serialNumber: "DEVICE_12345",
//                 state: true,
//             },
//             0 // The specific schema version you requested
//         );
//     });
//
//     it("test forward: pet detected", () => {
//         const state = true;
//
//         // 4. Emit the event from the mock device
//         mockDevice.emit("pet detected", mockDevice, state);
//
//         // // 5. Assert forwardEvent was called correctly
//         expect((forwarder as any).forwardEvent).toHaveBeenCalledWith(
//             {
//                 source: "device",
//                 event: DeviceEvent.petDetected,
//                 serialNumber: "DEVICE_12345",
//                 state: true,
//             },
//             0 // The specific schema version you requested
//         );
//     });
//
//     it("test forward: vehicle detected", () => {
//         const state = true;
//
//         // 4. Emit the event from the mock device
//         mockDevice.emit("vehicle detected", mockDevice, state);
//
//         // // 5. Assert forwardEvent was called correctly
//         expect((forwarder as any).forwardEvent).toHaveBeenCalledWith(
//             {
//                 source: "device",
//                 event: DeviceEvent.vehicleDetected,
//                 serialNumber: "DEVICE_12345",
//                 state: true,
//             },
//             14 // The specific schema version you requested
//         );
//     });
//
//     it("test forward: sound detected", () => {
//         const state = true;
//
//         // 4. Emit the event from the mock device
//         mockDevice.emit("sound detected", mockDevice, state);
//
//         // // 5. Assert forwardEvent was called correctly
//         expect((forwarder as any).forwardEvent).toHaveBeenCalledWith(
//             {
//                 source: "device",
//                 event: DeviceEvent.soundDetected,
//                 serialNumber: "DEVICE_12345",
//                 state: true,
//             },
//             0 // The specific schema version you requested
//         );
//     });
//
//     it("test forward: rings", () => {
//         const state = true;
//
//         // 4. Emit the event from the mock device
//         mockDevice.emit("rings", mockDevice, state);
//
//         // // 5. Assert forwardEvent was called correctly
//         expect((forwarder as any).forwardEvent).toHaveBeenCalledWith(
//             {
//                 source: "device",
//                 event: DeviceEvent.rings,
//                 serialNumber: "DEVICE_12345",
//                 state: true,
//             },
//             0 // The specific schema version you requested
//         );
//     });
//
//     it("test forward: package delivered", () => {
//         const state = true;
//
//         // 4. Emit the event from the mock device
//         mockDevice.emit("package delivered", mockDevice, state);
//
//         // // 5. Assert forwardEvent was called correctly
//         expect((forwarder as any).forwardEvent).toHaveBeenCalledWith(
//             {
//                 source: "device",
//                 event: DeviceEvent.packageDelivered,
//                 serialNumber: "DEVICE_12345",
//                 state: true,
//             },
//             13 // The specific schema version you requested
//         );
//     });
//
//     it("test forward: package stranded", () => {
//         const state = true;
//
//         // 4. Emit the event from the mock device
//         mockDevice.emit("package stranded", mockDevice, state);
//
//         // // 5. Assert forwardEvent was called correctly
//         expect((forwarder as any).forwardEvent).toHaveBeenCalledWith(
//             {
//                 source: "device",
//                 event: DeviceEvent.packageStranded,
//                 serialNumber: "DEVICE_12345",
//                 state: true,
//             },
//             13 // The specific schema version you requested
//         );
//     });
//
//     it("test forward: package taken", () => {
//         const state = true;
//
//         // 4. Emit the event from the mock device
//         mockDevice.emit("package taken", mockDevice, state);
//
//         // // 5. Assert forwardEvent was called correctly
//         expect((forwarder as any).forwardEvent).toHaveBeenCalledWith(
//             {
//                 source: "device",
//                 event: DeviceEvent.packageTaken,
//                 serialNumber: "DEVICE_12345",
//                 state: true,
//             },
//             13 // The specific schema version you requested
//         );
//     });
//
//     it("test forward: someone loitering", () => {
//         const state = true;
//
//         // 4. Emit the event from the mock device
//         mockDevice.emit("someone loitering", mockDevice, state);
//
//         // // 5. Assert forwardEvent was called correctly
//         expect((forwarder as any).forwardEvent).toHaveBeenCalledWith(
//             {
//                 source: "device",
//                 event: DeviceEvent.someoneLoitering,
//                 serialNumber: "DEVICE_12345",
//                 state: true,
//             },
//             13 // The specific schema version you requested
//         );
//     });
//
//     it("test forward: radar motion detected", () => {
//         const state = true;
//
//         // 4. Emit the event from the mock device
//         mockDevice.emit("radar motion detected", mockDevice, state);
//
//         // // 5. Assert forwardEvent was called correctly
//         expect((forwarder as any).forwardEvent).toHaveBeenCalledWith(
//             {
//                 source: "device",
//                 event: DeviceEvent.radarMotionDetected,
//                 serialNumber: "DEVICE_12345",
//                 state: true,
//             },
//             13 // The specific schema version you requested
//         );
//     });
//
//     it("test forward: open", () => {
//         const state = true;
//
//         // 4. Emit the event from the mock device
//         mockDevice.emit("open", mockDevice, state);
//
//         // // 5. Assert forwardEvent was called correctly
//         expect((forwarder as any).forwardEvent).toHaveBeenCalledWith(
//             {
//                 source: "device",
//                 event: DeviceEvent.sensorOpen,
//                 serialNumber: "DEVICE_12345",
//                 state: true,
//             },
//             0 // The specific schema version you requested
//         );
//     });
//
//     it("test forward: 911 alarm", () => {
//         const state = true;
//         const detail: SmartSafeAlarm911Event = SmartSafeAlarm911Event.ALARM
//
//         // 4. Emit the event from the mock device
//         mockDevice.emit("911 alarm", mockDevice, state, detail);
//
//         // // 5. Assert forwardEvent was called correctly
//         expect((forwarder as any).forwardEvent).toHaveBeenCalledWith(
//             {
//                 source: "device",
//                 event: DeviceEvent.alarm911,
//                 serialNumber: "DEVICE_12345",
//                 state: true,
//                 detail: SmartSafeAlarm911Event.ALARM
//             },
//             13 // The specific schema version you requested
//         );
//     });
//
//     it("test forward: shake alarm", () => {
//         const state = true;
//         const detail : SmartSafeShakeAlarmEvent = SmartSafeShakeAlarmEvent.ALARM
//
//         // 4. Emit the event from the mock device
//         mockDevice.emit("shake alarm", mockDevice, state, detail);
//
//         // // 5. Assert forwardEvent was called correctly
//         expect((forwarder as any).forwardEvent).toHaveBeenCalledWith(
//             {
//                 source: "device",
//                 event: DeviceEvent.shakeAlarm,
//                 serialNumber: "DEVICE_12345",
//                 state: true,
//                 detail: SmartSafeShakeAlarmEvent.ALARM
//             },
//             13 // The specific schema version you requested
//         );
//     });
//
//     it("test forward: wrong try-protect alarm", () => {
//         const state = true;
//
//         // 4. Emit the event from the mock device
//         mockDevice.emit("wrong try-protect alarm", mockDevice, state);
//
//         // // 5. Assert forwardEvent was called correctly
//         expect((forwarder as any).forwardEvent).toHaveBeenCalledWith(
//             {
//                 source: "device",
//                 event: DeviceEvent.wrongTryProtectAlarm,
//                 serialNumber: "DEVICE_12345",
//                 state: true,
//             },
//             13 // The specific schema version you requested
//         );
//     });
//
//
//     it("test forward: long time not close", () => {
//         const state = true;
//
//         // 4. Emit the event from the mock device
//         mockDevice.emit("long time not close", mockDevice, state);
//
//         // // 5. Assert forwardEvent was called correctly
//         expect((forwarder as any).forwardEvent).toHaveBeenCalledWith(
//             {
//                 source: "device",
//                 event: DeviceEvent.LongTimeNotClose,
//                 serialNumber: "DEVICE_12345",
//                 state: true,
//             },
//             13 // The specific schema version you requested
//         );
//     });
//
//
//     it("test forward: jammed", () => {
//         const state = true;
//
//         // 4. Emit the event from the mock device
//         mockDevice.emit("jammed", mockDevice, state);
//
//         // // 5. Assert forwardEvent was called correctly
//         expect((forwarder as any).forwardEvent).toHaveBeenCalledWith(
//             {
//                 source: "device",
//                 event: DeviceEvent.jammed,
//                 serialNumber: "DEVICE_12345",
//                 state: true,
//             },
//             13 // The specific schema version you requested
//         );
//     });
//
//     it("test forward: low battery", () => {
//         const state = true;
//
//         // 4. Emit the event from the mock device
//         mockDevice.emit("low battery", mockDevice, state);
//
//         // // 5. Assert forwardEvent was called correctly
//         expect((forwarder as any).forwardEvent).toHaveBeenCalledWith(
//             {
//                 source: "device",
//                 event: DeviceEvent.lowBattery,
//                 serialNumber: "DEVICE_12345",
//                 state: true,
//             },
//             13 // The specific schema version you requested
//         );
//     });
//
//
//     it("test forward: locked", () => {
//         const state = true;
//
//         // 4. Emit the event from the mock device
//         mockDevice.emit("locked", mockDevice, state);
//
//         // // 5. Assert forwardEvent was called correctly
//         expect((forwarder as any).forwardEvent).toHaveBeenCalledWith(
//             {
//                 source: "device",
//                 event: DeviceEvent.locked,
//                 serialNumber: "DEVICE_12345",
//                 state: true,
//             },
//             0 // The specific schema version you requested
//         );
//     });
//     it("test forward: stranger person detected", () => {
//         const state = true;
//
//         // 4. Emit the event from the mock device
//         mockDevice.emit("stranger person detected", mockDevice, state);
//
//         // // 5. Assert forwardEvent was called correctly
//         expect((forwarder as any).forwardEvent).toHaveBeenCalledWith(
//             {
//                 source: "device",
//                 event: DeviceEvent.strangerPersonDetected,
//                 serialNumber: "DEVICE_12345",
//                 state: true,
//             },
//             15 // The specific schema version you requested
//         );
//     });
//
//
//     it("test forward: dog detected", () => {
//         const state = true;
//
//         // 4. Emit the event from the mock device
//         mockDevice.emit("dog detected", mockDevice, state);
//
//         // // 5. Assert forwardEvent was called correctly
//         expect((forwarder as any).forwardEvent).toHaveBeenCalledWith(
//             {
//                 source: "device",
//                 event: DeviceEvent.dogDetected,
//                 serialNumber: "DEVICE_12345",
//                 state: true,
//             },
//             15 // The specific schema version you requested
//         );
//     });
//
//     it("test forward: dog lick detected", () => {
//         const state = true;
//
//         // 4. Emit the event from the mock device
//         mockDevice.emit("dog lick detected", mockDevice, state);
//
//         // // 5. Assert forwardEvent was called correctly
//         expect((forwarder as any).forwardEvent).toHaveBeenCalledWith(
//             {
//                 source: "device",
//                 event: DeviceEvent.dogLickDetected,
//                 serialNumber: "DEVICE_12345",
//                 state: true,
//             },
//             15 // The specific schema version you requested
//         );
//     });
//
//     it("test forward: dog poop detected", () => {
//         const state = true;
//
//         // 4. Emit the event from the mock device
//         mockDevice.emit("dog poop detected", mockDevice, state);
//
//         // // 5. Assert forwardEvent was called correctly
//         expect((forwarder as any).forwardEvent).toHaveBeenCalledWith(
//             {
//                 source: "device",
//                 event: DeviceEvent.dogPoopDetected,
//                 serialNumber: "DEVICE_12345",
//                 state: true,
//             },
//             15 // The specific schema version you requested
//         );
//     });
//
//
//     it("test forward: open", () => {
//         const state = true;
//
//         // 4. Emit the event from the mock device
//         mockDevice.emit("open", mockDevice, state);
//
//         // // 5. Assert forwardEvent was called correctly
//         expect((forwarder as any).forwardEvent).toHaveBeenCalledWith(
//             {
//                 source: "device",
//                 event: DeviceEvent.open,
//                 serialNumber: "DEVICE_12345",
//                 state: true,
//             },
//             21 // The specific schema version you requested
//         );
//     });
//
//     it("test forward: low temperature", () => {
//         const state = true;
//
//         // 4. Emit the event from the mock device
//         mockDevice.emit("low temperature", mockDevice, state);
//
//         // // 5. Assert forwardEvent was called correctly
//         expect((forwarder as any).forwardEvent).toHaveBeenCalledWith(
//             {
//                 source: "device",
//                 event: DeviceEvent.lowTemperature,
//                 serialNumber: "DEVICE_12345",
//                 state: true,
//             },
//             21 // The specific schema version you requested
//         );
//     });
//
//
//     it("test forward: high temperature", () => {
//         const state = true;
//
//         // 4. Emit the event from the mock device
//         mockDevice.emit("high temperature", mockDevice, state);
//
//         // // 5. Assert forwardEvent was called correctly
//         expect((forwarder as any).forwardEvent).toHaveBeenCalledWith(
//             {
//                 source: "device",
//                 event: DeviceEvent.highTemperature,
//                 serialNumber: "DEVICE_12345",
//                 state: true,
//             },
//             21 // The specific schema version you requested
//         );
//     });
//
//     it("test forward: pin incorrect", () => {
//         const state = true;
//
//         // 4. Emit the event from the mock device
//         mockDevice.emit("pin incorrect", mockDevice, state);
//
//         // // 5. Assert forwardEvent was called correctly
//         expect((forwarder as any).forwardEvent).toHaveBeenCalledWith(
//             {
//                 source: "device",
//                 event: DeviceEvent.pinIncorrect,
//                 serialNumber: "DEVICE_12345",
//                 state: true,
//             },
//             21 // The specific schema version you requested
//         );
//     });
//
//
//     it("test forward: lid stuck", () => {
//         const state = true;
//
//         // 4. Emit the event from the mock device
//         mockDevice.emit("lid stuck", mockDevice, state);
//
//         // // 5. Assert forwardEvent was called correctly
//         expect((forwarder as any).forwardEvent).toHaveBeenCalledWith(
//             {
//                 source: "device",
//                 event: DeviceEvent.lidStuck,
//                 serialNumber: "DEVICE_12345",
//                 state: true,
//             },
//             21 // The specific schema version you requested
//         );
//     });
//
//
//     it("test forward: battery fully charged", () => {
//         const state = true;
//
//         // 4. Emit the event from the mock device
//         mockDevice.emit("battery fully charged", mockDevice, state);
//
//         // // 5. Assert forwardEvent was called correctly
//         expect((forwarder as any).forwardEvent).toHaveBeenCalledWith(
//             {
//                 source: "device",
//                 event: DeviceEvent.batteryFullyCharged,
//                 serialNumber: "DEVICE_12345",
//                 state: true,
//             },
//             21 // The specific schema version you requested
//         );
//     });
//
//     it("test forward: property changed", () => {
//         let name = "test-name";
//         const ready = true;
//         const value = jest.fn();
//
//         // 4. Emit the event from the mock device
//         mockDevice.emit("property changed", mockDevice, name, value, ready);
//
//         // // 5. Assert forwardEvent was called correctly
//         expect((forwarder as any).forwardEvent).toHaveBeenCalledWith(
//             {
//                 source: "device",
//                 event: DeviceEvent.propertyChanged,
//                 serialNumber: "DEVICE_12345",
//                 name: name,
//                 timestamp: expect.anything(),
//                 value: value,
//             },
//             0, // The specific schema version you requested,
//             9
//         );
//
//
//         expect((forwarder as any).forwardEvent).toHaveBeenCalledWith(
//             {
//                 source: "device",
//                 event: DeviceEvent.propertyChanged,
//                 serialNumber: "DEVICE_12345",
//                 name: name,
//                 value: value,
//             },
//             10, // The specific schema version you requested,
//         );
//     });
//
// });

describe("Station Event Forwarding", () => {
    let mockDevice: any;
    let mockStation: any;
    let mockClients: any;
    let mockLogger: any;
    let forwarder: EventForwarder;

    before(() => {

        // 1. Create a mock station that behaves like an EventEmitter
        // We can use a real EventEmitter for simplicity in testing
        const {EventEmitter} = require("events");
        mockStation = new EventEmitter();
        mockStation.getSerial = jest.fn().mockReturnValue("STATION_12345");
        mockStation.getCurrentMode = jest.fn().mockReturnValue(2);
        mockStation.getGuardMode = jest.fn().mockReturnValue(3);
        mockDevice = new EventEmitter();
        mockDevice.getSerial = jest.fn().mockReturnValue("DEVICE_12345");

        const mockDriver = new EventEmitter();
        (mockDriver as any).getDevices = jest.fn<() => Promise<Device[]>>().mockResolvedValue([mockDevice]);
        (mockDriver as any).getStations = jest.fn<() => Promise<Station[]>>().mockResolvedValue([mockStation]);
        (mockDriver as any).getStationDevice = jest.fn<() => Promise<Device[]>>().mockResolvedValue(mockDevice);


        // 2. Mock your class EventForwarder and the forwardEvent method
        // Replace 'YourClassName' with the actual name of your class
        mockClients = {
            driver: mockDriver
        }; // Add methods if forwardEvent calls them
        mockLogger = {
            info: jest.fn(),
            error: jest.fn(),
            debug: jest.fn(),
        };
        forwarder = new EventForwarder(mockClients, mockLogger);
        jest.spyOn(forwarder, "forwardEvent" as any).mockImplementation(() => {
        });

        // 3. Register the listeners (call the method that sets up the .on() loops)
        forwarder.start();
    });

    afterEach(() => {
        DriverMessageHandler.tfa = false;
    });
    //
    // it("test forward: connect", () => {
    //
    //
    //     // 4. Emit the event from the mock station
    //     mockStation.emit("connect");
    //
    //     // // 5. Assert forwardEvent was called correctly
    //     expect((forwarder as any).forwardEvent).toHaveBeenCalledWith(
    //         {
    //             source: "station",
    //             event: StationEvent.connected,
    //             serialNumber: "STATION_12345",
    //         },
    //         0 // The specific schema version you requested
    //     );
    // });
    //
    // it("test forward: close", () => {
    //
    //
    //     // 4. Emit the event from the mock station
    //     mockStation.emit("close");
    //
    //     // // 5. Assert forwardEvent was called correctly
    //     expect((forwarder as any).forwardEvent).toHaveBeenCalledWith(
    //         {
    //             source: "station",
    //             event: StationEvent.disconnected,
    //             serialNumber: "STATION_12345",
    //         },
    //         0 // The specific schema version you requested
    //     );
    // });
    // it("test forward: connection error", () => {
    //
    //
    //     // 4. Emit the event from the mock station
    //     mockStation.emit("connection error");
    //
    //     // // 5. Assert forwardEvent was called correctly
    //     expect((forwarder as any).forwardEvent).toHaveBeenCalledWith(
    //         {
    //             source: "station",
    //             event: StationEvent.connectionError,
    //             serialNumber: "STATION_12345",
    //         },
    //         13 // The specific schema version you requested
    //     );
    // });
    //
    //
    // it("test forward: alarm event", () => {
    //     const alarmEvent: AlarmEvent = AlarmEvent.APP;
    //
    //     // 4. Emit the event from the mock station
    //     mockStation.emit("alarm event", mockStation, alarmEvent);
    //
    //     // // 5. Assert forwardEvent was called correctly
    //     expect((forwarder as any).forwardEvent).toHaveBeenCalledWith(
    //         {
    //             source: "station",
    //             event: StationEvent.alarmEvent,
    //             serialNumber: "STATION_12345",
    //             alarmEvent: AlarmEvent.APP
    //         },
    //         3 // The specific schema version you requested
    //     );
    // });
    //
    //
    // it("test forward: alarm delay event", () => {
    //     const alarmDelayEvent: AlarmEvent = AlarmEvent.APP;
    //     const alarmDelay: number= 10
    //
    //     // 4. Emit the event from the mock station
    //     mockStation.emit("alarm delay event", mockStation, alarmDelayEvent, alarmDelay);
    //
    //     // // 5. Assert forwardEvent was called correctly
    //     expect((forwarder as any).forwardEvent).toHaveBeenCalledWith(
    //         {
    //             source: "station",
    //             event: StationEvent.alarmDelayEvent,
    //             serialNumber: "STATION_12345",
    //             alarmDelayEvent: AlarmEvent.APP,
    //             alarmDelay: 10
    //         },
    //         11 // The specific schema version you requested
    //     );
    // });
    //
    // it("test forward: alarm armed event", () => {
    //
    //
    //     // 4. Emit the event from the mock station
    //     mockStation.emit("alarm armed event", mockStation);
    //
    //     // // 5. Assert forwardEvent was called correctly
    //     expect((forwarder as any).forwardEvent).toHaveBeenCalledWith(
    //         {
    //             source: "station",
    //             event: StationEvent.alarmArmedEvent,
    //             serialNumber: "STATION_12345"
    //         },
    //         11 // The specific schema version you requested
    //     );
    // });
    //
    // it("test forward: alarm arm delay event", () => {
    //     const armDelay : number = 10
    //
    //     // 4. Emit the event from the mock station
    //     mockStation.emit("alarm arm delay event", mockStation, armDelay);
    //
    //     // // 5. Assert forwardEvent was called correctly
    //     expect((forwarder as any).forwardEvent).toHaveBeenCalledWith(
    //         {
    //             source: "station",
    //             event: StationEvent.alarmArmDelayEvent,
    //             serialNumber: "STATION_12345",
    //             armDelay: 10
    //         },
    //         12 // The specific schema version you requested
    //     );
    // });
    //
    // it("test forward: database query latest", () => {
    //     const returnCode: DatabaseReturnCode = DatabaseReturnCode.SUCCESSFUL
    //     const data: Array<DatabaseQueryLatestInfo> = [{
    //         device_sn: "test",
    //         event_count: 1,
    //         crop_local_path: "/path"
    //     }]
    //
    //     // 4. Emit the event from the mock station
    //     mockStation.emit("database query latest", mockStation, returnCode, data);
    //
    //     // // 5. Assert forwardEvent was called correctly
    //     expect((forwarder as any).forwardEvent).toHaveBeenCalledWith(
    //         {
    //             source: "station",
    //             event: StationEvent.databaseQueryLatest,
    //             serialNumber: "STATION_12345",
    //             returnCode: DatabaseReturnCode.SUCCESSFUL,
    //             data: data
    //         },
    //         18 // The specific schema version you requested
    //     );
    // });
    //
    // it("test forward: database query local", () => {
    //     const returnCode: DatabaseReturnCode = DatabaseReturnCode.SUCCESSFUL
    //     const data: Array<DatabaseQueryLocal> = [{
    //         device_sn: "test",
    //         record_id: 1,
    //         station_sn: "test1",
    //         history: {
    //             device_type: DeviceType.STATION,
    //             account: "test",
    //             start_time: new Date(),
    //             end_time: new Date(),
    //             frame_num: 1,
    //             storage_type: P2PStorageType.HD,
    //             storage_cloud: true,
    //             cipher_id: 1,
    //             vision: 1,
    //             video_type: VideoType.PET,
    //             has_lock: false,
    //             automation_id: 1,
    //             trigger_type: TriggerType.MOTION1,
    //             push_mode: 1,
    //             mic_status: MicStatus.CLOSED,
    //             res_change: 10,
    //             res_best_width: 10,
    //             res_best_height: 10,
    //             self_learning: 1,
    //             storage_path:  "path",
    //             thumb_path: "thumb",
    //             write_status: 1,
    //             cloud_path: "path",
    //             folder_size:  1,
    //             storage_status: 1,
    //             storage_label: "label",
    //             time_zone: "timezone",
    //             mp4_cloud: "mp4",
    //             snapshot_cloud: "snapshot",
    //             table_version: "table_version"
    //         },
    //         picture: []
    //     }]
    //
    //     // 4. Emit the event from the mock station
    //     mockStation.emit("database query local", mockStation, returnCode, data);
    //
    //     // // 5. Assert forwardEvent was called correctly
    //     expect((forwarder as any).forwardEvent).toHaveBeenCalledWith(
    //         {
    //             source: "station",
    //             event: StationEvent.databaseQueryLocal,
    //             serialNumber: "STATION_12345",
    //             returnCode: DatabaseReturnCode.SUCCESSFUL,
    //             data: data
    //         },
    //         18 // The specific schema version you requested
    //     );
    // });
    //
    // it("test forward: database query by date", () => {
    //     const returnCode: DatabaseReturnCode = DatabaseReturnCode.SUCCESSFUL
    //     const data: Array<DatabaseQueryByDate> = [{
    //         device_sn: "sn",
    //         device_type: DeviceType.STATION,
    //         start_time: new Date(),
    //         end_time: new Date(),
    //         storage_path: "storage",
    //         thumb_path: "thumb",
    //         cipher_id: 1,
    //         folder_size: 2,
    //         frame_num: 3,
    //         trigger_type: TriggerType.MOTION1,
    //         video_type: VideoType.PET,
    //         record_id: 1,
    //         station_sn: "sn",
    //         storage_type: P2PStorageType.HD,
    //         storage_cloud: true
    //     }]
    //
    //     // 4. Emit the event from the mock station
    //     mockStation.emit("database query by date", mockStation, returnCode, data);
    //
    //     // // 5. Assert forwardEvent was called correctly
    //     expect((forwarder as any).forwardEvent).toHaveBeenCalledWith(
    //         {
    //             source: "station",
    //             event: StationEvent.databaseQueryByDate,
    //             serialNumber: "STATION_12345",
    //             returnCode: DatabaseReturnCode.SUCCESSFUL,
    //             data: data
    //         },
    //         18 // The specific schema version you requested
    //     );
    // });
    //
    // it("test forward: database count by date", () => {
    //     const returnCode: DatabaseReturnCode = DatabaseReturnCode.SUCCESSFUL
    //     const data: Array<DatabaseCountByDate> = [{
    //         day: new Date(),
    //         count: 2
    //     }]
    //
    //     // 4. Emit the event from the mock station
    //     mockStation.emit("database count by date", mockStation, returnCode, data);
    //
    //     // // 5. Assert forwardEvent was called correctly
    //     expect((forwarder as any).forwardEvent).toHaveBeenCalledWith(
    //         {
    //             source: "station",
    //             event: StationEvent.databaseCountByDate,
    //             serialNumber: "STATION_12345",
    //             returnCode: DatabaseReturnCode.SUCCESSFUL,
    //             data: data
    //         },
    //         18 // The specific schema version you requested
    //     );
    // });
    //
    // it("test forward: database delete", () => {
    //     const returnCode: DatabaseReturnCode = DatabaseReturnCode.SUCCESSFUL
    //     const failedIds: Array<unknown> = [1,2]
    //
    //     // 4. Emit the event from the mock station
    //     mockStation.emit("database delete", mockStation, returnCode, failedIds);
    //
    //     // // 5. Assert forwardEvent was called correctly
    //     expect((forwarder as any).forwardEvent).toHaveBeenCalledWith(
    //         {
    //             source: "station",
    //             event: StationEvent.databaseDelete,
    //             serialNumber: "STATION_12345",
    //             returnCode: DatabaseReturnCode.SUCCESSFUL,
    //             failedIds: failedIds
    //         },
    //         18 // The specific schema version you requested
    //     );
    // });
    //
    // it("test forward: guard mode", () => {
    //     const guardMode: number =1
    //
    //     // 4. Emit the event from the mock station
    //     mockStation.emit("guard mode", mockStation, guardMode);
    //
    //     // // 5. Assert forwardEvent was called correctly
    //     expect((forwarder as any).forwardEvent).toHaveBeenCalledWith(
    //         {
    //             source: "station",
    //             event: StationEvent.guardModeChanged,
    //             serialNumber: "STATION_12345",
    //             guardMode: guardMode,
    //             currentMode: 2
    //         },
    //         0,// The specific schema version you requested
    //         2
    //     );
    //
    //     expect((forwarder as any).forwardEvent).toHaveBeenCalledWith(
    //         {
    //             source: "station",
    //             event: StationEvent.guardModeChanged,
    //             serialNumber: "STATION_12345",
    //             guardMode: guardMode
    //         },
    //         3// The specific schema version you requested
    //
    //     );
    // });
    //
    //
    // it("test forward: current mode", () => {
    //     const currentMode: number =1
    //
    //     // 4. Emit the event from the mock station
    //     mockStation.emit("current mode", mockStation, currentMode);
    //
    //     // // 5. Assert forwardEvent was called correctly
    //     expect((forwarder as any).forwardEvent).toHaveBeenCalledWith(
    //         {
    //             source: "station",
    //             event: StationEvent.guardModeChanged,
    //             serialNumber: "STATION_12345",
    //             guardMode: 3,
    //             currentMode: currentMode
    //         },
    //         0,// The specific schema version you requested
    //         2
    //     );
    //
    //     expect((forwarder as any).forwardEvent).toHaveBeenCalledWith(
    //         {
    //             source: "station",
    //             event: StationEvent.currentModeChanged,
    //             serialNumber: "STATION_12345",
    //             currentMode: currentMode
    //         },
    //         3// The specific schema version you requested
    //
    //     );
    // });

    it("test forward: rtsp url", async () => {
        const rtspUrl: string = "linnkkk"
        const channel: number = 1
        const flushPromises = () => new Promise(resolve => setTimeout(resolve, 0));

        // Emit the event from the mock station
        mockStation.emit("rtsp url", mockStation, channel, rtspUrl);

        //  WAIT for the promise microtasks to finish
        await flushPromises();

        // Assert forwardEvent was called correctly
        expect((forwarder as any).forwardEvent).toHaveBeenCalledWith(
            {
                source: "device",
                event: DeviceEvent.gotRtspUrl,
                serialNumber: "DEVICE_12345",
                rtspUrl: rtspUrl
            },
            0// The specific schema version you requested

        );

    });


    // TODO: add test for further down conditions
    it("test forward: command result", async () => {
        const result: CommandResult =  {
            command_type: CommandType.CMD_HUB_REBOOT,
            channel: Station.CHANNEL,
            return_code: 1
        }
        // Emit the event from the mock station
        mockStation.emit("command result", mockStation, result);


        // Assert forwardEvent was called correctly
        expect((forwarder as any).forwardEvent).toHaveBeenCalledWith(
            {
                source: "station",
                event: StationEvent.commandResult,
                serialNumber: "STATION_12345",
                command: "reboot",
                returnCode: result.return_code,
                returnCodeName:  ErrorCode[result.return_code]
            },
            0,// The specific schema version you requested
            12

        );

    });

    it("test forward: property changed", async () => {
        const name: string = "whatever";
        const value: PropertyValue = 1;
        const ready: boolean = true;
        // Emit the event from the mock station
        mockStation.emit("property changed", mockStation, name, value, ready);


        // Assert forwardEvent was called correctly
        expect((forwarder as any).forwardEvent).toHaveBeenCalledWith(
            {
                source: "station",
                event: StationEvent.propertyChanged,
                serialNumber: "STATION_12345",
                name: name,
                value:value,
                timestamp:  expect.anything()
            },
            0,// The specific schema version you requested
            9

        );

        expect((forwarder as any).forwardEvent).toHaveBeenCalledWith(
            {
                source: "station",
                event: StationEvent.propertyChanged,
                serialNumber: "STATION_12345",
                name: name,
                value:value
            },
            10// The specific schema version you requested


        );

    });

    it("test forward: device pin verified", async () => {
        const successfull: boolean = true;
        const deviceSN: string = "sn"
        // Emit the event from the mock station
        mockStation.emit("device pin verified", deviceSN ,successfull);


        // Assert forwardEvent was called correctly
        expect((forwarder as any).forwardEvent).toHaveBeenCalledWith(
            {
                source: "device",
                event: DeviceEvent.pinVerified,
                serialNumber: "sn",
                successfull: true
            },
            13// The specific schema version you requested

        );

    });



});