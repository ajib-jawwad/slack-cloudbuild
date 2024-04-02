const winston = require("winston");

let LogLevel = {};
LogLevel["ERROR"] = "error";
LogLevel["WARN"] = "warn";
LogLevel["INFO"] = "info";
LogLevel["VERBOSE"] = "verbose";
LogLevel["DEBUG"] = "debug";
LogLevel["SILLY"] = "silly";

class Logger {
    static error(message, logData) {
        Logger.log(LogLevel.ERROR, message, logData);
    }
    static warn(message, logData) {
        Logger.log(LogLevel.WARN, message, logData);
    }
    static info(message, logData) {
        Logger.log(LogLevel.INFO, message, logData);
    }
    static verbose(message, logData) {
        Logger.log(LogLevel.VERBOSE, message, logData);
    }
    static debug(message, logData) {
        Logger.log(LogLevel.DEBUG, message, logData);
    }
    static silly(message, logData) {
        Logger.log(LogLevel.SILLY, message, logData);
    }
    static debugSql(message) {
        Logger.log(LogLevel.DEBUG, message, {});
    }
    static constructTransports() {
        const transports = [];
        transports.push(new winston.transports.Console({
            level: process.env.LOG_LEVEL,
            format: winston.format.json()
        }));
        return transports;
    }

    static log(level, message, data) {
        console.log(data)
        Logger.logger.log(level, message, Object.assign(
            Object.assign({}, data), { 
                timestamp: new Date().toISOString() 
            }
        ));
    }
}

exports.Logger = Logger;
Logger.logger = winston.createLogger({
    transports: Logger.constructTransports(),
    exitOnError: false
});
