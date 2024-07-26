import { expect } from 'chai';
import { describe, it, before, after } from 'mocha';
import supertestSession from 'supertest-session';
import { server } from '../src/app.js';
import mongoose from 'mongoose';
import qs from 'qs'; // URL-encoding

describe('Carts API Tests', () => {
  const request = supertestSession(server);
  let productId = null;
  let cartId = null;

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

    const testProduct = {
      title: 'Test Product',
      description: 'This is a test product',
      code: 'TP001',
      price: 100,
      stock: 10,
      category: 'test'
    };

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

  after(async () => {
    await request.get('/api/session/logout');
    try {
      if (mongoose.connection.name === 'test') {
        await mongoose.connection.dropDatabase();
        console.log(`Dropping DB_name ${mongoose.connection.name}`)
      } else {
        console.error(`NOT dropping DB_name ${mongoose.connection.name}`)
      }
      server.close();
    } catch (error) {
      console.error(`Error closing server or cleaning up database: ${error}`);
    }
  });

  it('Nuevo carrito', async () => {
    const res = await request
      .post('/api/carts')
      .expect(201);

    console.log(res.body)
    try {
      expect(res.body).to.have.property('_id');
      expect(mongoose.Types.ObjectId.isValid(res.body._id)).to.be.true;
      cartId = res.body._id;
      console.log(`Carrito creado ${cartId}`)
    } catch (error) {
      console.error('Respuesta a Nuevo carrito:', res.body);
      throw error;
    }
  });

  it('Obtener carrito por id', async () => {
    const res = await request
      .get(`/api/carts/${cartId}`)
      .expect(200);

    try {
      expect(res.body).to.have.property('_id', cartId);
      expect(mongoose.Types.ObjectId.isValid(res.body._id)).to.be.true;
    } catch (error) {
      console.error('Respuesta a Obtener carrito por id:', res.body);
      throw error;
    }
  });

  it('Agregar producto al carrito', async () => {
    try {
      const res = await request
        .post(`/api/carts/${cartId}/product/${productId}`)
        .expect(201);

      expect(res.body[1]).to.have.property('acknowledged', true);
      expect(res.body[0]).to.have.property('_id', cartId);
    } catch (error) {
      console.error('Respuesta a Agregar producto al carrito:', res.body);
      throw error;
    }
  });

  it('Actualizar carrito', async () => {
    const updatedCart = {
      products: [
        {
          "product": {
            "_id": productId,
            "price": 805
          },
          "quantity": 2,
          "productPriceTotal": 1610
        },
      ]
    };
    const res = await request
      .put(`/api/carts/${cartId}`)
      .send(updatedCart)
      .expect(200);
    console.log(JSON.stringify(res.body))

    try {
      expect(res.body[1]).to.have.property('acknowledged', true);
      expect(res.body[0]).to.have.property('_id', cartId);
    } catch (error) {
      console.error('Respusta a Actualizar carrito:', res.body);
      throw error;
    }
  });

  it('Actualizar producto del carrito', async () => {

    const updatedProduct = {
      "product": {
        "_id": productId,
      },
      "quantity": 33,
    };

    const res = await request
      .put(`/api/carts/${cartId}/product/${productId}`)
      .send(updatedProduct)
      .expect(200);

    try {
      expect(res.body[1]).to.have.property('acknowledged', true);
      expect(res.body[0]).to.have.property('_id');
      expect(mongoose.Types.ObjectId.isValid(res.body[0]._id)).to.be.true;
      expect(res.body[0]).to.have.property('products');
      expect(res.body[0].products[0]).to.have.property('quantity', 33);
    } catch (error) {
      console.error('Respusta a Actualizar producto del carrito:', res.body);
      throw error;
    }
  });

  it('Quitar producto del carrito', async () => {
    const res = await request
      .delete(`/api/carts/${cartId}/product/${productId}`)
      .expect(200);
    try {
      expect(res.body[1]).to.have.property('acknowledged', true);
    } catch (error) {
      console.error('Respuesta a Quitar producto del carrito:', res.body);
      throw error;
    }
  });

  it('Vaciar carrito', async () => {
    const res = await request
      .delete(`/api/carts/${cartId}`)
      .expect(200);
    try {
      expect(res.body[1]).to.have.property('acknowledged', true);
      expect(res.body[0]).to.have.property('_id', cartId);
      expect(res.body[0]).to.have.property('products');
      expect(res.body[0].products).to.be.an('array').that.is.empty;
    } catch (error) {
      console.error('Respusta a Vaciar carrito:', res.body);
      throw error;
    }
  });

  it('Generar ticket', async () => {
    await request
      .post(`/api/carts/${cartId}/product/${productId}`)
      .expect(201);

    const res = await request
      .get(`/api/carts/${cartId}/purchase`)
      .expect(200);

    try {
      const { ticket } = res.body;
      expect(ticket).to.have.property('_id');
      expect(mongoose.Types.ObjectId.isValid(ticket._id)).to.be.true;
    } catch (error) {
      console.error('Respuesta a Generar ticket:', res.body);
      throw error;
    }
  });
});
