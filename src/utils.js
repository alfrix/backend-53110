import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import path from "node:path";
import bcrypt from "bcrypt";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rutaproducts = path.join(
  path.resolve(__dirname, ".."),
  "data/products.json"
);
const rutacarts = path.join(path.resolve(__dirname, ".."), "data/carts.json");

export { __dirname, rutaproducts, rutacarts };

function createHash(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(10));
}

export { createHash };

function validatePass(user, password) {
  return bcrypt.compareSync(password, user.password);
}

export { validatePass };
