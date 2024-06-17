import dotenv from "dotenv";
import { Command, Option } from "commander";

let program = new Command();

program.addOption(
  new Option(
    "-m --mode <MODE>",
    "Modo de operacion desarrollo o produccion",
    "dev"
  )
    .choices(["dev", "production"])
    .default("dev")
);

program.addOption(
  new Option(
    "-d --db_mode <MODE_DB>",
    "Modo de operacion DB online o local",
    "online"
  )
    .choices(["local", "online"])
    .default("online")
);

program.parse();
const opts = program.opts();

dotenv.config({
  path: "./src/.env",
  override: true,
});

export const config = {
  MODE: opts.mode,
  DB_MODE: opts.db_mode,
  PORT: process.env.PORT || 8080,
  dbName: process.env.DB_NAME,
  mongoUrl:
    opts.db_mode === "local"
      ? process.env.MONGO_URL_LOCAL
      : process.env.MONGO_URL_ATLAS,
  SECRET: process.env.SECRET
};
