import dotenv from "dotenv";
import { Command, Option } from "commander";

let program = new Command();

program.addOption(new Option(
  "-m --mode <MODE>",
  "Modo de operacion DB online o local",
  "online").choices(["local", "online"]).default("online")
);

program.parse();
const opts = program.opts();
console.log(`Modo de operación ${opts.mode}`);

dotenv.config({
  path: "./src/.env",
  override: true,
});

export const config = {
  MODO: opts.mode,
  PORT: process.env.PORT || 8080,
  dbName: process.env.DB_NAME,
  mongoUrl:
    opts.mode === "local"
      ? process.env.MONGO_URL_LOCAL
      : process.env.MONGO_URL_ATLAS,
};
