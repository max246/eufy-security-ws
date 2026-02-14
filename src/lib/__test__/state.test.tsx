import { jest } from "@jest/globals";

import { EufySecurity } from "eufy-security-client";
import {dumpState} from "../state.js";

describe("dumpState", () => {
    let mockDriver: any;
    const OLD_SCHEMA = 0;
    const NEW_SCHEMA = 15;

    beforeEach(() => {

        // Create a mock instance of the driver
        mockDriver = {
            isPushConnected: jest.fn(),
            isConnected: jest.fn().mockReturnValue(false),
            getStations: jest.fn(),
            getDevices: jest.fn(),
            getVersion: jest.fn().mockReturnValue("1.0.0"),
            isMQTTConnected: jest.fn(),
        };
    });

    it("should return serial numbers for the NEW schema version when connected", async () => {
        mockDriver.isConnected.mockReturnValue(true);
        mockDriver.getStations.mockResolvedValue([{  getSerial: () => "STATION_123" }]);
        mockDriver.getDevices.mockResolvedValue([{ getSerial: () => "DEVICE_456" }]);

        const result = await dumpState(mockDriver as unknown as EufySecurity, NEW_SCHEMA);

        // Verify the "new" behavior (returns strings/serials)
        expect(result.stations[0]).toEqual("STATION_123");
        expect(result.devices[0]).toEqual("DEVICE_456");
        expect(mockDriver.getStations).toHaveBeenCalled();
    });

    it("should return empty arrays for the NEW schema version when disconnected", async () => {
        mockDriver.isConnected.mockReturnValue(false);

        const result = await dumpState(mockDriver as unknown as EufySecurity, NEW_SCHEMA);

        expect(result.stations).toEqual([]);
        expect(result.devices).toEqual([]);
    });

    it("should call dumpStation/dumpDevice for the OLD schema version", async () => {
        mockDriver.isConnected.mockReturnValue(true);

        // Mocking the data objects that dumpStation/dumpDevice would process
        const mockStation = { name: "Base Station", getPropertyValue : jest.fn().mockReturnValue({}) , isConnected : jest.fn()};
        const mockDevice = { name: "Entry Sensor", getPropertyValue : jest.fn().mockReturnValue({}) , isConnected : jest.fn() };

        mockDriver.getStations.mockResolvedValue([mockStation]);
        mockDriver.getDevices.mockResolvedValue([mockDevice]);
        mockDriver.getPropertyValue = jest.fn();

        const result = await dumpState(mockDriver as unknown as EufySecurity, OLD_SCHEMA);

        // Verify arrays are populated (actual content depends on your dumpStation mock/logic)
        expect(result.stations).toHaveLength(1);
        expect(result.devices).toHaveLength(1);
    });
});