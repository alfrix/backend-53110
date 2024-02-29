import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rutaproducts = path.join(path.resolve(__dirname, '..'), "data/products.json");
const rutacarts = path.join(path.resolve(__dirname, '..'), "data/carts.json");

export { __dirname, rutaproducts, rutacarts };
