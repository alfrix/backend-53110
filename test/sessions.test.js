import { expect } from 'chai';
import { describe, it, after } from 'mocha';
import supertestSession from 'supertest-session';
import { server } from '../src/app.js';
import qs from 'qs'; // URL-encoding
import mongoose from 'mongoose';

const testUser = {
  email: 'testuser@example.com',
  password: 'testpassword',
  firstName: 'Test',
  lastName: 'User',
  age: 30
};

describe('Session API Tests', () => {
  const request = supertestSession(server);

  after(async () => {
    try {
      if (mongoose.connection.name === 'test') {
        await mongoose.connection.dropDatabase();
        console.log(`Dropping DB_name ${mongoose.connection.name}`)
      } else {
        console.error(`NOT dropping DB_name ${mongoose.connection.name}`)
      }
      server.close();
    } catch (error) {
      console.error(`Error closing server: ${error}`);
    }
  });

  it('Registro de nuevo usuario', async () => {
    const res = await request
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

    try {
      expect(res.body).to.have.property('message', `Registrado: ${testUser.email}`);
      expect(res.body).to.have.property('email', testUser.email);
    } catch (error) {
      console.error('Error en la respuesta de registro:', res.body);
      throw error;
    }
  });

  it('Iniciar sesión', async () => {
    const res = await request
      .post('/api/session/login')
      .type('form')
      .send(qs.stringify({ email: testUser.email, password: testUser.password }))
      .expect(200);

    try {
      expect(res.body).to.have.property('message', `Bienvenido ${testUser.firstName}`);
      expect(res.body).to.have.property('user');
      expect(res.body.user).to.have.property('email', testUser.email);
    } catch (error) {
      console.error('Error en la respuesta de login:', res.body);
      throw error;
    }
  });

  it('Obtener usuario actual', async () => {
    const res = await request
      .get('/api/session/current')
      .expect(200);

    try {
      expect(res.body).to.have.property('user');
      const user = res.body.user;
      expect(user).to.have.property('email', testUser.email);
      expect(user).to.have.property('last_name', 'User');
      expect(user).to.have.property('rol', 'user');
      expect(user).to.have.property('cart');
    } catch (error) {
      console.error('Respuesta a Obtener usuario actual:', res.body);
      throw error;
    }
  });


  it('Cerrar sesión', async () => {
    const res = await request
      .get('/api/session/logout')
      .expect(200);

    try {
      expect(res.body).to.have.property('message', 'Sesión cerrada correctamente');
    } catch (error) {
      console.error('Error en la respuesta de logout:', res.body);
      throw error;
    }
  });
});
