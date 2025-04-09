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

  describe('POST /products', () => {
    it('should create a new product', async () => {
      const response = await request(app)
        .post('/products')
        .send({ name: 'Test Product', price: 99.99 })
        .expect(201);

      expect(response.body).toHaveProperty('message', 'Product added successfully.');
      expect(response.body).toHaveProperty('productId');
    });

    it('should return 400 for invalid data', async () => {
      const response = await request(app)
        .post('/products')
        .send({ name: 'Test Product' }) // Missing price
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Invalid data format');
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

  describe('GET /products/:id', () => {
    it('should return a specific product', async () => {
      // First, add a product
      const createResponse = await request(app)
        .post('/products')
        .send({ name: 'Test Product', price: 99.99 });

      const productId = createResponse.body.productId;

      const response = await request(app)
        .get(`/products/${productId}`)
        .expect(200);

      expect(response.body).toHaveProperty('name', 'Test Product');
      expect(response.body).toHaveProperty('price', 99.99);
    });

    it('should return 404 for non-existent product', async () => {
      const response = await request(app)
        .get('/products/99999')
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Product not found');
    });
  });
}); 