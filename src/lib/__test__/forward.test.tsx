import {jest} from "@jest/globals";
import {EventForwarder} from "../forward.js";
import {DeviceEvent} from "../device/event.js";
import {before} from "node:test";
import {DriverMessageHandler} from "../driver/message_handler.js";
import {EventEmitter} from "events";
import {Device, SmartSafeAlarm911Event, SmartSafeShakeAlarmEvent, Station} from "eufy-security-client"; // Adjust path to your enums

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
        mockDevice = new EventEmitter();
        mockDevice.getSerial = jest.fn().mockReturnValue("DEVICE_12345");

        const mockDriver = new EventEmitter();
        (mockDriver as any).getDevices = jest.fn<() => Promise<Device[]>>().mockResolvedValue([mockDevice]);
        (mockDriver as any).getStations = jest.fn<() => Promise<Station[]>>().mockResolvedValue([mockStation]);

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

    it("test forward: motion detected", () => {
        const state = true;

        // 4. Emit the event from the mock station
        mockDevice.emit("motion detected", mockDevice, state);

        // // 5. Assert forwardEvent was called correctly
        expect((forwarder as any).forwardEvent).toHaveBeenCalledWith(
            {
                source: "device",
                event: DeviceEvent.motionDetected,
                serialNumber: "DEVICE_12345",
                state: true,
            },
            0 // The specific schema version you requested
        );
    });

    it("test forward: person detected", () => {
        const state = true;
        const person = "a person"

        // 4. Emit the event from the mock device
        mockDevice.emit("person detected", mockDevice, state, person);

        // // 5. Assert forwardEvent was called correctly
        expect((forwarder as any).forwardEvent).toHaveBeenCalledWith(
            {
                source: "device",
                event: DeviceEvent.personDetected,
                serialNumber: "DEVICE_12345",
                state: true,
                person: "a person"
            },
            0 // The specific schema version you requested
        );
    });

    it("test forward: crying detected", () => {
        const state = true;

        // 4. Emit the event from the mock device
        mockDevice.emit("crying detected", mockDevice, state);

        // // 5. Assert forwardEvent was called correctly
        expect((forwarder as any).forwardEvent).toHaveBeenCalledWith(
            {
                source: "device",
                event: DeviceEvent.cryingDetected,
                serialNumber: "DEVICE_12345",
                state: true,
            },
            0 // The specific schema version you requested
        );
    });

    it("test forward: pet detected", () => {
        const state = true;

        // 4. Emit the event from the mock device
        mockDevice.emit("pet detected", mockDevice, state);

        // // 5. Assert forwardEvent was called correctly
        expect((forwarder as any).forwardEvent).toHaveBeenCalledWith(
            {
                source: "device",
                event: DeviceEvent.petDetected,
                serialNumber: "DEVICE_12345",
                state: true,
            },
            0 // The specific schema version you requested
        );
    });

    it("test forward: vehicle detected", () => {
        const state = true;

        // 4. Emit the event from the mock device
        mockDevice.emit("vehicle detected", mockDevice, state);

        // // 5. Assert forwardEvent was called correctly
        expect((forwarder as any).forwardEvent).toHaveBeenCalledWith(
            {
                source: "device",
                event: DeviceEvent.vehicleDetected,
                serialNumber: "DEVICE_12345",
                state: true,
            },
            14 // The specific schema version you requested
        );
    });

    it("test forward: sound detected", () => {
        const state = true;

        // 4. Emit the event from the mock device
        mockDevice.emit("sound detected", mockDevice, state);

        // // 5. Assert forwardEvent was called correctly
        expect((forwarder as any).forwardEvent).toHaveBeenCalledWith(
            {
                source: "device",
                event: DeviceEvent.soundDetected,
                serialNumber: "DEVICE_12345",
                state: true,
            },
            0 // The specific schema version you requested
        );
    });

    it("test forward: rings", () => {
        const state = true;

        // 4. Emit the event from the mock device
        mockDevice.emit("rings", mockDevice, state);

        // // 5. Assert forwardEvent was called correctly
        expect((forwarder as any).forwardEvent).toHaveBeenCalledWith(
            {
                source: "device",
                event: DeviceEvent.rings,
                serialNumber: "DEVICE_12345",
                state: true,
            },
            0 // The specific schema version you requested
        );
    });

    it("test forward: package delivered", () => {
        const state = true;

        // 4. Emit the event from the mock device
        mockDevice.emit("package delivered", mockDevice, state);

        // // 5. Assert forwardEvent was called correctly
        expect((forwarder as any).forwardEvent).toHaveBeenCalledWith(
            {
                source: "device",
                event: DeviceEvent.packageDelivered,
                serialNumber: "DEVICE_12345",
                state: true,
            },
            13 // The specific schema version you requested
        );
    });

    it("test forward: package stranded", () => {
        const state = true;

        // 4. Emit the event from the mock device
        mockDevice.emit("package stranded", mockDevice, state);

        // // 5. Assert forwardEvent was called correctly
        expect((forwarder as any).forwardEvent).toHaveBeenCalledWith(
            {
                source: "device",
                event: DeviceEvent.packageStranded,
                serialNumber: "DEVICE_12345",
                state: true,
            },
            13 // The specific schema version you requested
        );
    });

    it("test forward: package taken", () => {
        const state = true;

        // 4. Emit the event from the mock device
        mockDevice.emit("package taken", mockDevice, state);

        // // 5. Assert forwardEvent was called correctly
        expect((forwarder as any).forwardEvent).toHaveBeenCalledWith(
            {
                source: "device",
                event: DeviceEvent.packageTaken,
                serialNumber: "DEVICE_12345",
                state: true,
            },
            13 // The specific schema version you requested
        );
    });

    it("test forward: someone loitering", () => {
        const state = true;

        // 4. Emit the event from the mock device
        mockDevice.emit("someone loitering", mockDevice, state);

        // // 5. Assert forwardEvent was called correctly
        expect((forwarder as any).forwardEvent).toHaveBeenCalledWith(
            {
                source: "device",
                event: DeviceEvent.someoneLoitering,
                serialNumber: "DEVICE_12345",
                state: true,
            },
            13 // The specific schema version you requested
        );
    });

    it("test forward: radar motion detected", () => {
        const state = true;

        // 4. Emit the event from the mock device
        mockDevice.emit("radar motion detected", mockDevice, state);

        // // 5. Assert forwardEvent was called correctly
        expect((forwarder as any).forwardEvent).toHaveBeenCalledWith(
            {
                source: "device",
                event: DeviceEvent.radarMotionDetected,
                serialNumber: "DEVICE_12345",
                state: true,
            },
            13 // The specific schema version you requested
        );
    });

    it("test forward: open", () => {
        const state = true;

        // 4. Emit the event from the mock device
        mockDevice.emit("open", mockDevice, state);

        // // 5. Assert forwardEvent was called correctly
        expect((forwarder as any).forwardEvent).toHaveBeenCalledWith(
            {
                source: "device",
                event: DeviceEvent.sensorOpen,
                serialNumber: "DEVICE_12345",
                state: true,
            },
            0 // The specific schema version you requested
        );
    });

    it("test forward: 911 alarm", () => {
        const state = true;
        const detail: SmartSafeAlarm911Event = SmartSafeAlarm911Event.ALARM

        // 4. Emit the event from the mock device
        mockDevice.emit("911 alarm", mockDevice, state, detail);

        // // 5. Assert forwardEvent was called correctly
        expect((forwarder as any).forwardEvent).toHaveBeenCalledWith(
            {
                source: "device",
                event: DeviceEvent.alarm911,
                serialNumber: "DEVICE_12345",
                state: true,
                detail: SmartSafeAlarm911Event.ALARM
            },
            13 // The specific schema version you requested
        );
    });

    it("test forward: shake alarm", () => {
        const state = true;
        const detail : SmartSafeShakeAlarmEvent = SmartSafeShakeAlarmEvent.ALARM

        // 4. Emit the event from the mock device
        mockDevice.emit("shake alarm", mockDevice, state, detail);

        // // 5. Assert forwardEvent was called correctly
        expect((forwarder as any).forwardEvent).toHaveBeenCalledWith(
            {
                source: "device",
                event: DeviceEvent.shakeAlarm,
                serialNumber: "DEVICE_12345",
                state: true,
                detail: SmartSafeShakeAlarmEvent.ALARM
            },
            13 // The specific schema version you requested
        );
    });

    it("test forward: wrong try-protect alarm", () => {
        const state = true;

        // 4. Emit the event from the mock device
        mockDevice.emit("wrong try-protect alarm", mockDevice, state);

        // // 5. Assert forwardEvent was called correctly
        expect((forwarder as any).forwardEvent).toHaveBeenCalledWith(
            {
                source: "device",
                event: DeviceEvent.wrongTryProtectAlarm,
                serialNumber: "DEVICE_12345",
                state: true,
            },
            13 // The specific schema version you requested
        );
    });


    it("test forward: long time not close", () => {
        const state = true;

        // 4. Emit the event from the mock device
        mockDevice.emit("long time not close", mockDevice, state);

        // // 5. Assert forwardEvent was called correctly
        expect((forwarder as any).forwardEvent).toHaveBeenCalledWith(
            {
                source: "device",
                event: DeviceEvent.LongTimeNotClose,
                serialNumber: "DEVICE_12345",
                state: true,
            },
            13 // The specific schema version you requested
        );
    });


    it("test forward: jammed", () => {
        const state = true;

        // 4. Emit the event from the mock device
        mockDevice.emit("jammed", mockDevice, state);

        // // 5. Assert forwardEvent was called correctly
        expect((forwarder as any).forwardEvent).toHaveBeenCalledWith(
            {
                source: "device",
                event: DeviceEvent.jammed,
                serialNumber: "DEVICE_12345",
                state: true,
            },
            13 // The specific schema version you requested
        );
    });

    it("test forward: low battery", () => {
        const state = true;

        // 4. Emit the event from the mock device
        mockDevice.emit("low battery", mockDevice, state);

        // // 5. Assert forwardEvent was called correctly
        expect((forwarder as any).forwardEvent).toHaveBeenCalledWith(
            {
                source: "device",
                event: DeviceEvent.lowBattery,
                serialNumber: "DEVICE_12345",
                state: true,
            },
            13 // The specific schema version you requested
        );
    });


    it("test forward: locked", () => {
        const state = true;

        // 4. Emit the event from the mock device
        mockDevice.emit("locked", mockDevice, state);

        // // 5. Assert forwardEvent was called correctly
        expect((forwarder as any).forwardEvent).toHaveBeenCalledWith(
            {
                source: "device",
                event: DeviceEvent.locked,
                serialNumber: "DEVICE_12345",
                state: true,
            },
            0 // The specific schema version you requested
        );
    });
    it("test forward: stranger person detected", () => {
        const state = true;

        // 4. Emit the event from the mock device
        mockDevice.emit("stranger person detected", mockDevice, state);

        // // 5. Assert forwardEvent was called correctly
        expect((forwarder as any).forwardEvent).toHaveBeenCalledWith(
            {
                source: "device",
                event: DeviceEvent.strangerPersonDetected,
                serialNumber: "DEVICE_12345",
                state: true,
            },
            15 // The specific schema version you requested
        );
    });


    it("test forward: dog detected", () => {
        const state = true;

        // 4. Emit the event from the mock device
        mockDevice.emit("dog detected", mockDevice, state);

        // // 5. Assert forwardEvent was called correctly
        expect((forwarder as any).forwardEvent).toHaveBeenCalledWith(
            {
                source: "device",
                event: DeviceEvent.dogDetected,
                serialNumber: "DEVICE_12345",
                state: true,
            },
            15 // The specific schema version you requested
        );
    });

    it("test forward: dog lick detected", () => {
        const state = true;

        // 4. Emit the event from the mock device
        mockDevice.emit("dog lick detected", mockDevice, state);

        // // 5. Assert forwardEvent was called correctly
        expect((forwarder as any).forwardEvent).toHaveBeenCalledWith(
            {
                source: "device",
                event: DeviceEvent.dogLickDetected,
                serialNumber: "DEVICE_12345",
                state: true,
            },
            15 // The specific schema version you requested
        );
    });

    it("test forward: dog poop detected", () => {
        const state = true;

        // 4. Emit the event from the mock device
        mockDevice.emit("dog poop detected", mockDevice, state);

        // // 5. Assert forwardEvent was called correctly
        expect((forwarder as any).forwardEvent).toHaveBeenCalledWith(
            {
                source: "device",
                event: DeviceEvent.dogPoopDetected,
                serialNumber: "DEVICE_12345",
                state: true,
            },
            15 // The specific schema version you requested
        );
    });


    it("test forward: open", () => {
        const state = true;

        // 4. Emit the event from the mock device
        mockDevice.emit("open", mockDevice, state);

        // // 5. Assert forwardEvent was called correctly
        expect((forwarder as any).forwardEvent).toHaveBeenCalledWith(
            {
                source: "device",
                event: DeviceEvent.open,
                serialNumber: "DEVICE_12345",
                state: true,
            },
            21 // The specific schema version you requested
        );
    });

    it("test forward: low temperature", () => {
        const state = true;

        // 4. Emit the event from the mock device
        mockDevice.emit("low temperature", mockDevice, state);

        // // 5. Assert forwardEvent was called correctly
        expect((forwarder as any).forwardEvent).toHaveBeenCalledWith(
            {
                source: "device",
                event: DeviceEvent.lowTemperature,
                serialNumber: "DEVICE_12345",
                state: true,
            },
            21 // The specific schema version you requested
        );
    });


    it("test forward: high temperature", () => {
        const state = true;

        // 4. Emit the event from the mock device
        mockDevice.emit("high temperature", mockDevice, state);

        // // 5. Assert forwardEvent was called correctly
        expect((forwarder as any).forwardEvent).toHaveBeenCalledWith(
            {
                source: "device",
                event: DeviceEvent.highTemperature,
                serialNumber: "DEVICE_12345",
                state: true,
            },
            21 // The specific schema version you requested
        );
    });

    it("test forward: pin incorrect", () => {
        const state = true;

        // 4. Emit the event from the mock device
        mockDevice.emit("pin incorrect", mockDevice, state);

        // // 5. Assert forwardEvent was called correctly
        expect((forwarder as any).forwardEvent).toHaveBeenCalledWith(
            {
                source: "device",
                event: DeviceEvent.pinIncorrect,
                serialNumber: "DEVICE_12345",
                state: true,
            },
            21 // The specific schema version you requested
        );
    });


    it("test forward: lid stuck", () => {
        const state = true;

        // 4. Emit the event from the mock device
        mockDevice.emit("lid stuck", mockDevice, state);

        // // 5. Assert forwardEvent was called correctly
        expect((forwarder as any).forwardEvent).toHaveBeenCalledWith(
            {
                source: "device",
                event: DeviceEvent.lidStuck,
                serialNumber: "DEVICE_12345",
                state: true,
            },
            21 // The specific schema version you requested
        );
    });


    it("test forward: battery fully charged", () => {
        const state = true;

        // 4. Emit the event from the mock device
        mockDevice.emit("battery fully charged", mockDevice, state);

        // // 5. Assert forwardEvent was called correctly
        expect((forwarder as any).forwardEvent).toHaveBeenCalledWith(
            {
                source: "device",
                event: DeviceEvent.batteryFullyCharged,
                serialNumber: "DEVICE_12345",
                state: true,
            },
            21 // The specific schema version you requested
        );
    });

    it("test forward: property changed", () => {
        let name = "test-name";
        const ready = true;
        const value = jest.fn();

        // 4. Emit the event from the mock device
        mockDevice.emit("property changed", mockDevice, name, value, ready);

        // // 5. Assert forwardEvent was called correctly
        expect((forwarder as any).forwardEvent).toHaveBeenCalledWith(
            {
                source: "device",
                event: DeviceEvent.propertyChanged,
                serialNumber: "DEVICE_12345",
                name: name,
                timestamp: expect.anything(),
                value: value,
            },
            0, // The specific schema version you requested,
            9
        );


        expect((forwarder as any).forwardEvent).toHaveBeenCalledWith(
            {
                source: "device",
                event: DeviceEvent.propertyChanged,
                serialNumber: "DEVICE_12345",
                name: name,
                value: value,
            },
            10, // The specific schema version you requested,
        );
    });

});