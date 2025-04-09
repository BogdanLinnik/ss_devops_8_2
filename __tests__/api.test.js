const request = require('supertest');
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const { app, db } = require('../index');

// Override the PORT for testing
process.env.PORT = 5001;
process.env.CLIENT_PORT = 3001;

describe('API Endpoints', () => {
  let server;

  beforeAll(() => {
    // Start the server
    server = app.listen(process.env.PORT);
  });

  afterAll((done) => {
    // Close the server
    server.close(() => {
      done();
    });
  });

  describe('GET /products', () => {
    it('should return all products', async () => {
      // First, add a product
      await request(app)
        .post('/products')
        .send({ name: 'Test Product', price: 99.99 });

      const response = await request(app)
        .get('/products')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('name');
      expect(response.body[0]).toHaveProperty('price');
    });
  });
}); 