import { expect } from 'chai';
import { describe, it, before, after } from 'mocha';
import supertestSession from 'supertest-session';
import { server } from '../src/app.js';
import jwt from 'jsonwebtoken';
import { config } from '../src/config/config.js';

const testUser = {
  email: 'testuser@example.com',
  password: 'testpassword'
};

describe('Session API Tests', () => {
  const request = supertestSession(server);

  after(async () => {
    try {
      server.close();
    } catch (error) {
      console.error(`Error closing server: ${error}`);
    }
  });

  it('Iniciar sesión', async () => {
    const res = await request
      .post('/api/session/login')
      .send(testUser)
      .expect(302);
    try {
      expect(res.header).to.have.property('location', '/?message=Bienvenido%20test');
    } catch (error) {
      console.error('Respuesta a Iniciar sesión:', res.body);
      throw error;
    }
  });

  it('Obtener usuario actual', async () => {
    const res = await request
      .get('/api/session/current')
      .expect(200);

    try {
      expect(res.body).to.have.property('user');
      expect(res.body.user.email).to.equal(testUser.email);
    } catch (error) {
      console.error('Respuesta a Obtener usuario actual:', res.body);
      throw error;
    }
  });

  it('Cerrar sesión', async () => {
    const res = await request
      .get('/api/session/logout')
      .expect(302);

    try {
      expect(res.header).to.have.property('location', '/login?success=Sesi%C3%B3n%20cerrada%20correctamente');
    } catch (error) {
      console.error('Respuesta a Cerrar sesiónn:', res.body);
      throw error;
    }
  });
});
