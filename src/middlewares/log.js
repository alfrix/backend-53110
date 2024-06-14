import { __dirname } from "../utils.js";
import winston from "winston";
import { config } from "../config/config.js";

const customLevels = {
  levels: {
    fatal: 0,
    error: 1,
    warning: 2,
    info: 3,
    http: 4,
    debug: 5,
  },
  colors: {
    debug: "cyan",
    http: "blue",
    info: "green",
    warning: "yellow",
    error: "red",
    fatal: "magenta",
  },
};

winston.addColors(customLevels.colors);

const customFormat = winston.format.printf(({ level, message, timestamp }) => {
  let formattedTimestamp = timestamp.replace(/[T]/g, " ");
  formattedTimestamp = formattedTimestamp.replace(/[Z]/g, "");
  const coloredLevel = winston.format
    .colorize()
    .colorize(level, level.toUpperCase());
  return `${formattedTimestamp} ${coloredLevel}: ${message}`;
});

export const logger = winston.createLogger({
  levels: customLevels.levels,
  transports: [
    new winston.transports.File({
      level: "warning",
      filename: "./logs/error.log",
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.prettyPrint()
      ),
    }),
  ],
});

const production = new winston.transports.Console({
  level: "info",
  format: winston.format.combine(winston.format.timestamp(), customFormat),
});

const dev = new winston.transports.Console({
  level: "debug",
  format: winston.format.combine(winston.format.timestamp(), customFormat),
});

if (config.MODE == "dev") {
  logger.add(dev);
  logger.info("Logger de desarrollo");
} else {
  logger.add(production);
  logger.info("Logger de produccion");
}

export const middlewareLogger = (req, res, next) => {
  req.logger = logger;
  next();
};
