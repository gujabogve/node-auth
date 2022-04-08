import { LoggerLevelEnum } from './enums/logger-level.enum';
import { ConsoleTransportInstance } from 'winston/lib/winston/transports';
import { createLogger, transports, format } from 'winston';
import 'winston-daily-rotate-file';
import DailyRotateFile, {
  DailyRotateFileTransportOptions,
} from 'winston-daily-rotate-file';

const { combine, errors, printf, timestamp } = format;

// Amount of files or amount of days to keep logs
const ROTATION_INTERVAL = process.env.NODE_ENV === 'development' ? 1 : '90d';

const customFormat = printf(
  ({ level, message, timestamp, stack, requestUID }) => {
    return `${timestamp} : ${level}  ${requestUID ? `: ${requestUID} ` : ''}: ${
      stack || message
    }`;
  }
);
const dailyRotateFileConfig: DailyRotateFileTransportOptions = {
  filename: 'log',
  datePattern: 'YYYY-MM-DD',
  maxFiles: ROTATION_INTERVAL,
  auditFile: `${process.env.LOGS_PATH}/list.json`,
  dirname: process.env.LOGS_PATH,
  extension: '.log',
};

const loggerTransports: (DailyRotateFile | ConsoleTransportInstance)[] = [];

if (process.env.NODE_ENV === 'development') {
  dailyRotateFileConfig.datePattern = 'YYYY-MM-DD-HH-mm';
  dailyRotateFileConfig.frequency = '20m';

  loggerTransports.push(
    new transports.Console({
      level: LoggerLevelEnum.warn,
      handleExceptions: true,
    })
  );
}

const fileTransport = new transports.DailyRotateFile(dailyRotateFileConfig);
loggerTransports.push(fileTransport);

const logger = createLogger({
  format: combine(timestamp(), errors({ stack: true }), customFormat),
  exitOnError: false,
  level: LoggerLevelEnum.http,
  transports: loggerTransports,
});

const loggerStream = (level: LoggerLevelEnum, requestUID: string) => {
  return {
    write: (text: string) => {
      logger[level](text, { requestUID });
    },
  };
};

export { logger, loggerStream };
