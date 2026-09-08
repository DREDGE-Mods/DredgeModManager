export enum LogLevel {
    UNITY,
    DEBUG,
    INFO,
    SUCCESS,
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
