import { expect } from 'chai';
import { describe, it, before, after, beforeEach, afterEach } from 'mocha';
import supertestSession from 'supertest-session';
import { server } from '../src/app.js';
import mongoose from 'mongoose';
import qs from 'qs'; // URL-encoding

describe('Products API Tests', () => {
  const request = supertestSession(server);

  before(async () => {
    const testUser = {
      email: 'testuser@example.com',
      password: 'testpassword',
      firstName: 'Test',
      lastName: 'User',
      age: 30
    };
    await request
      .post('/api/session/signup')
      .type('form')
      .send(qs.stringify({
        firstName: testUser.firstName,
        lastName: testUser.lastName,
        age: testUser.age,
        email: testUser.email,
        password: testUser.password
      }))
      .expect(200);
    await request
      .post('/api/session/login')
      .set('Content-Type', 'application/x-www-form-urlencoded')
      .send(qs.stringify({
        email: testUser.email,
        password: testUser.password
      })).expect(200);

  });

  after(async () => {
    try {
      if (mongoose.connection.name === 'test') {
        await mongoose.connection.dropDatabase();
        console.log(`Dropping DB_name ${mongoose.connection.name}`)
      } else {
        console.error(`NOT dropping DB_name ${mongoose.connection.name}`)
      }
      await request.get('/api/session/logout');
      server.close();
    } catch (error) {
      console.error(`Error closing server: ${error}`);
    }
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

    it('Crear un producto nuevo', async () => {
      const res = await request.post('/api/products').send(testProduct).expect(201);

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

      try {
        expect(res.body).to.have.property('_id', productId);
        expect(res.body).to.have.property('title', testProduct.title);
      } catch (error) {
        console.error('Respusta a obtener un producto:', res.body);
        throw error;
      }
    });

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

    it('Actualizar un producto', async () => {
      const updatedProduct = {
        title: 'Updated Product',
        description: 'This is an updated product',
        price: 150
      };

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

      try {
        expect(res.body).to.have.property('success', false);
      } catch (error) {
        console.error('Respusta al verificar delete:', res.body);
        throw error;
      }
    });
  });
});
