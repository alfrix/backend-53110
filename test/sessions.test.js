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

  before(async () => {
    await request.post('/api/session/signup').send(testUser);
  });

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
      .expect(200);

    expect(res.header).to.have.property('location', '/?message=Bienvenido testuser@example.com');
  });

  it('Obtener usuario actual', async () => {
    const res = await request
      .get('/api/session/current')
      .expect(200);

    expect(res.body).to.have.property('user');
    expect(res.body.user.email).to.equal(testUser.email);
  });

  it('Cerrar sesión', async () => {
    const res = await request
      .get('/api/session/logout')
      .expect(200);

    expect(res.header).to.have.property('location', '/login?success=Sesión cerrada correctamente');
  });

  it('Enviar mail de recuperación', async () => {
    const res = await request
      .post('/api/session/recovery')
      .send({ email: testUser.email })
      .expect(200);

    expect(res.header).to.have.property('location', '/login?message=Email de recuperación enviado');
  });

  it('Cambiar contraseña (token)', async () => {
    const token = jwt.sign({ _id: 'mockUserId', email: testUser.email }, config.SECRET, { expiresIn: '1h' });

    const res = await request
      .post(`/api/session/passwordChange/${token}`)
      .send({
        InputPassword1: 'newpassword',
        InputPassword2: 'newpassword'
      })
      .expect(200);

    expect(res.header).to.have.property('location', '/login?message=Contraseña cambiada exitosamente');
  });
});
