import dotenv from "dotenv";

const mode = "online";

dotenv.config({
  path: "./src/.env",
  override: true,
});

export const config = {
  MODO: mode,
  PORT: process.env.PORT || 8080,
  dbName: process.env.DB_NAME,
  mongoUrl:
    mode === "local"
      ? process.env.MONGO_URL_LOCAL
      : process.env.MONGO_URL_ATLAS,
};
