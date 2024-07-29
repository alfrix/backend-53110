import dotenv from "dotenv";
import { Command, Option } from "commander";

let program = new Command();
let opts = {}

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

dotenv.config({
  path: "./src/.env",
  override: true,
});

let dbName = process.env.DB_NAME;
if (process.env.NODE_ENV !== 'testing') {
  // no parsear o no funcionan las opciones the mocha --bail y --exit
  program.parse();
  opts = program.opts();
} else {
  // testing
  dbName = "test";
  console.log("TESTING")
}



if (!dbName) {
  console.error("DB not defined")
  process.exit(1)
}



export const config = {
  MODE: opts.mode || "dev",
  DB_MODE: opts.db_mode || "online",
  PORT: process.env.PORT || 8080,
  dbName: dbName,
  mongoUrl:
    opts.db_mode === "local"
      ? process.env.MONGO_URL_LOCAL
      : process.env.MONGO_URL_ATLAS,
  SECRET: process.env.SECRET
};
