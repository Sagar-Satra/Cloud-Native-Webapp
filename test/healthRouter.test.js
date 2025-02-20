import request from 'supertest';
import { use, expect } from 'chai';
import chaiHttp from 'chai-http';
import { app } from '../index.js';
import sequelize from '../app/database/db.js';

const chai = use(chaiHttp);

describe('Healthz Test', () => {

    const invalidMethods = ['put', 'post', 'patch', 'delete'];

    // Ensure database connection is established before running tests
    before(async () => {
        try {
            await sequelize.authenticate();
            console.log("Database connection established for tests.");
        } catch (error) {
            console.error("Failed to connect to the database:", error);
        }
    });

    // Closing the Sequelize connection after all tests
    after(async () => {
        await sequelize.close();
        console.log("Database connection closed after tests.");
    });

    // Get API request testing
    it('Gets the health of the database', async () => {
        let response;
        try {
            await sequelize.authenticate();
            response = await request(app).get('/healthz');
            expect(response.status).to.equal(200);
        } catch (error) {
            response = await request(app).get('/healthz');
            expect(response.status).to.equal(503);
        }

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

    // Testing for invalid HTTP methods
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
        await sequelize.close(); // Simulate database unavailability
        const response = await request(app).get('/healthz');
        expect(response.status).to.equal(503);

        // Restart the connection for the remaining tests
        await sequelize.authenticate();
    });
});
