import log4js from "log4js";

log4js.configure({
  appenders: {
    console: { type: "console" },
    file: { type: "file", filename: "logs/app.log" },
    errors: { type: "file", filename: "logs/errors.log" }
  },
  categories: {
    default: { appenders: ["console", "file"], level: "info" },
    error: { appenders: ["errors"], level: "error" }
  }
});

const logger = log4js.getLogger();
const errorLogger = log4js.getLogger("error");

export { logger, errorLogger }; 
