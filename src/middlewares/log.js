import { __dirname } from "../utils.js";
import winston from "winston";
import { config } from "../config/config.js";

const customLevels = {
  levels: {
    debug: 0,
    http: 1,
    info: 2,
    warning: 3,
    error: 4,
    fatal: 5,
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
      level: "warn",
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

const desarrollo = new winston.transports.Console({
  level: "debug",
  format: winston.format.combine(winston.format.timestamp(), customFormat),
});

if (config.MODE === "dev") {
  logger.add(desarrollo);
} else {
  logger.add(production);
}

export const middlewareLogger = (req, res, next) => {
  req.logger = logger;
  next();
};
