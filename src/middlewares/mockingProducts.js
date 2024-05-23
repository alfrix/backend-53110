import { faker } from "@faker-js/faker";

export const mockingProducts = async (req, res, next) => {
  let products = [];

  for (let i = 0; i < 100; i++) {
    const product = {
      _id: faker.string.uuid(),
      title: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      code: faker.commerce.isbn(),
      price: faker.commerce.price({ min: 20, max: 1000, dec: 0 }),
      stock: faker.string.numeric({ length: { min: 1, max: 3 } }),
      category: faker.commerce.department(),
      status: true,
      thumbnails: [],
    };
    products.push(product);
  }

  res.setHeader("Content-Type", "application/json");
  return res.status(200).json(products);
};
