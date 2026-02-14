import { EufySecurity } from "eufy-security-client";

import { DeviceState, dumpDevice } from "./device/state.js";
import { DriverState, dumpDriver } from "./driver/state.js";
import { dumpStation, StationState } from "./station/state.js";
import {oldSchemaVersion} from "./const.js";

export type Modify<T, R> = Omit<T, keyof R> & R;

export interface EufySecurityStateSchema0 {
  driver: DriverState;
  stations: Array<StationState>;
  devices: Array<DeviceState>;
}

type EufySecurityStateSchema1 = Modify<
  Omit<EufySecurityStateSchema0, "stations" | "devices">,
  {
    stations: Array<string>;
    devices: Array<string>;
  }
>;

export type EufySecurityState = EufySecurityStateSchema0 | EufySecurityStateSchema1;

export const dumpState = async (driver: EufySecurity, schemaVersion: number): Promise<EufySecurityState> => {

  const base_old: Partial<EufySecurityStateSchema0> = {
    driver: dumpDriver(driver, schemaVersion),
    stations: [],
    devices:  [],
  };

  const base_new: Partial<EufySecurityStateSchema1> = {
    driver: dumpDriver(driver, schemaVersion),
    stations: [],
    devices:  [],
  };

  // Old version schema
  if (schemaVersion < oldSchemaVersion) {
    if (driver.isConnected()) {
      base_old.stations = Array.from(await driver.getStations(), (station) => dumpStation(station, schemaVersion))
      base_old.devices = Array.from(await driver.getDevices(), (device) => dumpDevice(device, schemaVersion))
    }
    return base_old as EufySecurityStateSchema0;
  // New version schema
  } else {
    if (driver.isConnected()) {
      base_new.stations = driver.isConnected() ? Array.from(await driver.getStations(), (station) => station.getSerial()) : [];
      base_new.devices = driver.isConnected() ? Array.from(await driver.getDevices(), (device) => device.getSerial()) : [];
    }
    return base_new as EufySecurityStateSchema1;
  }

};
