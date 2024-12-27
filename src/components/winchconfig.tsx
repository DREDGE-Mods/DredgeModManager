export enum LogLevel {
    UNITY,
    DEBUG,
    INFO,
    WARN,
    ERROR
}

export interface WinchConfig {
    WriteLogsToFile : boolean,
    WriteLogsToConsole : boolean,
    LogLevel : LogLevel,
    LogsFolder : string,
    DetailedLogSources : boolean,
    EnableDeveloperConsole : boolean,
    MaxLogFiles : number,
    LogPort: string,
    RunExe : boolean
}

export class DefaultWinchConfig implements WinchConfig {
    WriteLogsToFile: boolean = true;
    WriteLogsToConsole: boolean = false;
    LogLevel: LogLevel = LogLevel.DEBUG;
    LogsFolder: string = "Logs";
    DetailedLogSources: boolean = false;
    EnableDeveloperConsole: boolean = true;
    MaxLogFiles: number = 10;
    LogPort: string = "";
    RunExe: boolean = false;
}