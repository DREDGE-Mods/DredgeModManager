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
    MaxLogFiles : number
}