import { expect } from 'chai';
import { describe, it, before, after, beforeEach, afterEach } from 'mocha';
import supertestSession from 'supertest-session';
import { server } from '../src/app.js';
import mongoose from 'mongoose';

describe('Products API Tests', () => {
  const request = supertestSession(server);

  after(async () => {
    try {
      server.close();
    } catch (error) {
      console.error(`Error closing server: ${error}`);
    }
  });

  describe('Obtener todos los productos', () => {
    it('get /api/products', async () => {
      const res = await request.get('/api/products').expect(200);

      expect(res.body).to.have.property('status', 'success');
      expect(res.body).to.have.property('payload').that.is.an('array');
      expect(res.body.payload.length).to.be.greaterThan(0);
      res.body.payload.forEach((product) => {
        expect(mongoose.Types.ObjectId.isValid(product._id)).to.be.true;
      });
      expect(res.body).to.have.property('totalPages');
      expect(res.body).to.have.property('prevPage');
      expect(res.body).to.have.property('nextPage');
      expect(res.body).to.have.property('page');
      expect(res.body).to.have.property('hasPrevPage');
      expect(res.body).to.have.property('hasNextPage');
    });
  });

  describe('Verificar CRUD de productos', () => {
    const testProduct = {
      title: 'Test Product',
      description: 'This is a test product',
      code: 'TP001',
      price: 100,
      stock: 10,
      category: 'test'
    };
    let productId;

    before(async () => {
      await request
        .post('/api/session/login')
        .set('Content-Type', 'application/x-www-form-urlencoded')
        .send('email=adminCoder@coder.com&password=adminCod3r123')
    });

    after(async () => {
      await request.get('/api/session/logout');
    });

    it('Crear un producto nuevo', async () => {
      const res = await request.post('/api/products').send(testProduct).expect(201);
      //  [
      //     null,
      //     {
      //         title: 'Test Product',
      //         description: 'This is a test product',
      //         code: 'TP001',
      //         price: 100,
      //         stock: 10,
      //         category: 'test',
      //         status: true,
      //         thumbnails: [],
      //         owner: 'admin',
      //         _id: '668458f3c9c14febd53bda85',
      //         createdAt: '2024-07-02T19:45:55.246Z',
      //         updatedAt: '2024-07-02T19:45:55.246Z',
      //         __v: 0
      //     }
      // ]
      try {
        const product = res.body[1];
        expect(product).to.have.property('title', testProduct.title);
        expect(product).to.have.property('_id');
        productId = product._id;
      } catch (error) {
        console.error(res ? res.body : error)
        throw error
      }
    });

    it('Obtener un producto por id', async () => {
      const res = await request.get(`/api/products/${productId}`).expect(200);
      // {
      //     "_id": "66844d5420e6f01fbeb0d796",
      //     "title": "Test Product",
      //     "description": "This is a test product",
      //     "code": "TP001",
      //     "price": 100,
      //     "stock": 10,
      //     "category": "test",
      //     "status": true,
      //     "thumbnails": [],
      //     "owner": "admin",
      //     "createdAt": "2024-07-02T18:56:20.605Z",
      //     "updatedAt": "2024-07-02T18:56:20.605Z",
      //     "__v": 0
      // }
      try {
        expect(res.body).to.have.property('_id', productId);
        expect(res.body).to.have.property('title', testProduct.title);
      } catch (error) {
        console.error('Respusta a obtener un producto:', res.body);
        throw error;
      }
    });

    it('Actualizar un producto', async () => {
      const updatedProduct = {
        title: 'Updated Product',
        description: 'This is an updated product',
        price: 150
      };
      // [
      //     {
      //         "_id": "6684545a09e638f25e89005e",
      //         "title": "Glass",
      //         "description": "Fantastical",
      //         "code": "978-0-273-46246-9",
      //         "price": 838,
      //         "stock": 891,
      //         "category": "Games",
      //         "status": true,
      //         "thumbnails": [],
      //         "createdAt": "2024-07-02T19:26:18.091Z",
      //         "updatedAt": "2024-07-02T19:27:27.490Z",
      //         "__v": 0,
      //         "owner": "adminCoder@coder.com"
      //     },
      //     {
      //         "acknowledged": true,
      //         "modifiedCount": 1,
      //         "upsertedId": null,
      //         "upsertedCount": 0,
      //         "matchedCount": 1
      //     }
      // ]
      const res = await request.put(`/api/products/${productId}`).send(updatedProduct).expect(200);
      try {
        expect(res.body[0]).to.have.property('title', updatedProduct.title);
        expect(res.body[0]).to.have.property('description', updatedProduct.description);
        expect(res.body[0]).to.have.property('price', updatedProduct.price);
      } catch (error) {
        console.error('Respusta al actualizar:', res.body);
        throw error;
      }

    });

    it('Borrar un producto', async () => {
      const res = await request.delete(`/api/products/${productId}`).expect(200);
      // {
      //     "acknowledged": true,
      //     "deletedCount": 1
      // }
      try {
        expect(res.body).to.have.property('acknowledged', true);
        expect(res.body).to.have.property('deletedCount', 1);
      } catch (error) {
        console.error('Respusta al delete:', res.body);
        throw error;

      }
    });

    it('Verificar que el producto fue borrado', async () => {
      const res = await request.get(`/api/products/${productId}`).expect(404);
      // {
      //   "success": false,
      //   "error": "Fallo al obtener producto: Error: No encontrado 6684545a09e638f25e89005e"
      // }
      try {
        expect(res.body).to.have.property('success', false);
      } catch (error) {
        console.error('Respusta al verificar delete:', res.body);
        throw error;
      }
    });
  });
});
