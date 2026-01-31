const request = require('supertest');
const app = require('../app');

// Mock the database connection
jest.mock('../config/db', () => {
    return {
        execute: jest.fn()
    };
});

const pool = require('../config/db');
const bcrypt = require('bcryptjs');

describe('Mocked API Tests', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /api/auth/login', () => {
        it('should login successfully with mocked DB', async () => {
            // Mock DB response for finding user
            const mockUser = {
                id: 1,
                name: 'Test Admin',
                email: 'admin@demo.com',
                password_hash: '$2a$10$abcdefg...', // Mocked hash
                role: 'admin',
                tenant_id: 'tenant-123'
            };

            // Mock bcrypt.compare to return true
            jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);

            // Mock pool.execute to return [rows, fields]
            pool.execute.mockResolvedValueOnce([[mockUser], []]);

            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'admin@demo.com',
                    password: 'password123'
                });

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('token');
        });

        it('should return 401 if user not found', async () => {
            // Mock empty result
            pool.execute.mockResolvedValueOnce([[], []]);

            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'fail@demo.com',
                    password: 'wrong'
                });

            expect(res.statusCode).toEqual(401);
        });
    });

    describe('GET /api/leads (Protected)', () => {
        it('should return 401 without token', async () => {
            const res = await request(app).get('/api/leads');
            expect(res.statusCode).toEqual(401);
        });

        // Note: Testing protected routes with mocks requires either mocking the middleware 
        // OR generating a valid JWT token signed with the secret in existing .env
    });
});
