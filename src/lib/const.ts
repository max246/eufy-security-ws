import {DeviceEvent} from "./device/event.js";
import {StationEvent} from "./station/event.js";
import {
    DatabaseCountByDate,
    DatabaseQueryByDate,
    DatabaseQueryLatestInfo,
    DatabaseQueryLocal,
    DatabaseReturnCode, Device,
    Station
} from "eufy-security-client";

export const version = "1.9.9";

// minimal schema version the server supports
export const minSchemaVersion = 0;

// maximal/current schema version the server supports
export const maxSchemaVersion = 21;

// old version reference
export const oldSchemaVersion = 13;


export const schemaStationForwardTopic : [
    {
        name: "alarm delay event",
        src: "station",
        event: StationEvent.alarmDelayEvent,
        minSchemaVersion: 11,
        map: (st: Station, alarmDelayEvent: AlarmEvent, alarmDelay: number) => ({ alarmDelayEvent, alarmDelay })
    },
    {
        name: "alarm armed event",
        src: "station",
        event: StationEvent.alarmArmedEvent,
        minSchemaVersion: 11
    },
    {
        name: "alarm arm delay event",
        src: "station",
        event: StationEvent.alarmArmDelayEvent,
        minSchemaVersion: 12,
        map: (st: Station, armDelay: number) => ({ armDelay })
    },
    {
        name: "device pin verified",
        src: "device",
        event: DeviceEvent.pinVerified,
        minSchemaVersion: 13,
        map: (deviceSN: string, successful: boolean) => ({ deviceSN, successful })
    },
    {
        name: "database query latest",
        src: "station",
        event: StationEvent.databaseQueryLatest,
        minSchemaVersion: 18,
        map: (station: Station, returnCode: DatabaseReturnCode, data: Array<DatabaseQueryLatestInfo>) => ({ station, returnCode, data })
    },
    {
        name: "database query latest",
        src: "station",
        event: StationEvent.databaseQueryLocal,
        minSchemaVersion: 18,
        map: (station: Station, returnCode: DatabaseReturnCode, data: Array<DatabaseQueryLocal>) => ({ station, returnCode, data })
    },
    {
        name: "database query by date",
        src: "station",
        event: StationEvent.databaseQueryByDate,
        minSchemaVersion: 18,
        map: (station: Station, returnCode: DatabaseReturnCode, data: Array<DatabaseQueryByDate>) => ({ station, returnCode, data })
    },
    {
        name: "database count by date",
        src: "station",
        event: StationEvent.databaseCountByDate,
        minSchemaVersion: 18,
        map: (station: Station, returnCode: DatabaseReturnCode, data: Array<DatabaseCountByDate>) => ({ station, returnCode, data })
    },
    {
        name: "database delete",
        src: "station",
        event: StationEvent.databaseDelete,
        minSchemaVersion: 18,
        map: (station: Station, returnCode: DatabaseReturnCode, failedIds: Array<unknown>) => ({ station, returnCode, data })
    }
];

export const schemaDeviceForwardTopic : [
    {
        name: "motion detected",
        src: "device",
        event: DeviceEvent.motionDetected,
        minSchemaVersion: 0,
        map: (device: Device, state: boolean) => ({ device, state })
    }
    ];