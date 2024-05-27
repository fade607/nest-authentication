import { createLogger, format, transports } from "winston";

const customFormat = format.printf(({ timestamp, level, stack, message }) => {
    return `${timestamp} - [${level.toUpperCase().padEnd(7)}] - ${stack || message}`;
});

const options = {
    file: {
        filename: 'combined.log',
        level: 'silly'
    },
    console: {
        level: 'silly'
    }
};

// for development environment
const devLogger = {
    format: format.combine(
        format.timestamp(),
        format.errors({ stack: true }),
        customFormat
    ),
    transports: [
        new transports.Console(options.console),
        new transports.File(options.file) // Add file transport
    ]
};

const instanceLogger = devLogger;
export const instance = createLogger(instanceLogger);
