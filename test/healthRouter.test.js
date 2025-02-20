import request from 'supertest';
import { use, expect } from 'chai';
import chaiHttp from 'chai-http';
import { app } from '../index.js';
import sequelize from '../app/database/db.js';
import sinon from 'sinon';

const chai = use(chaiHttp);

describe('Healthz Test', () => {

    let sequelizeMock; // Add this line

    before(() => {
        sequelizeMock = sinon.stub(sequelize, 'authenticate'); // Mock sequelize.authenticate
    });

    afterEach(() => {
        sequelizeMock.reset(); // Reset mock after each test
    });

    after(() => {
        sequelizeMock.restore(); // Restore original functionality after all tests
    });

    const invalidMethods = ['put', 'post', 'patch', 'delete'];

    // Get API request testing
    it('Gets the health of the database', async () => {
        sequelizeMock.resolves(); // Simulate successful authentication
        const response = await request(app).get('/healthz');
        expect(response.status).to.equal(200);

        expect(response.header['cache-control']).to.exist;
        expect(response.header['cache-control']).to.include('no-cache');
        expect(response.header['cache-control']).to.include('no-store');
        expect(response.header['cache-control']).to.include('must-revalidate');

        expect(response.header['pragma']).to.exist;
        expect(response.header['pragma']).to.equal('no-cache');
    });

    // Testing for payload
    it('Throws error 400 - Bad Request if payload is sent in the body', async () => {
        const data = {
            name: 'Sagar'
        };
        const response = await request(app).get('/healthz').send(data);
        expect(response.status).to.equal(400);
        expect(response.header['cache-control']).to.exist;
        expect(response.header['cache-control']).to.include('no-cache');
        expect(response.header['cache-control']).to.include('no-store');
        expect(response.header['cache-control']).to.include('must-revalidate');
    });

    // Testing for query parameters
    it('Throws error 400 - Bad Request if query parameters are sent', async () => {
        const response = await request(app).get('/healthz?name=sagar');
        expect(response.status).to.equal(400);
        expect(response.header['cache-control']).to.exist;
        expect(response.header['cache-control']).to.include('no-cache');
        expect(response.header['cache-control']).to.include('no-store');
        expect(response.header['cache-control']).to.include('must-revalidate');
    });

    // testing for invalid methods
    invalidMethods.forEach(method => {
        it(`${method} method not allowed. Request fails`, async () => {
            const response = await request(app)[method]('/healthz');
            expect(response.status).to.equal(405);
            expect(response.header['cache-control']).to.exist;
            expect(response.header['cache-control']).to.include('no-cache');
            expect(response.header['cache-control']).to.include('no-store');
            expect(response.header['cache-control']).to.include('must-revalidate');
        });
    });

    // Simulating an unavailable database by closing the connection
    it('Throws error status 503 if database is unavailable', async () => {
        
        await sequelize.close();
        
        const response = await request(app).get('/healthz');
        
        expect(response.status).to.equal(503);
        expect(response.header['cache-control']).to.exist;
        expect(response.header['cache-control']).to.include('no-cache');
        expect(response.header['cache-control']).to.include('no-store');
        expect(response.header['cache-control']).to.include('must-revalidate');
    });
});
