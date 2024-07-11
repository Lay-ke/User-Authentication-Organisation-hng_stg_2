const request = require('supertest');
const {app} = require('../server'); // Adjust the import to your Express app's location
const { User, Organisation } = require('../model/user'); // Adjust the import to your Sequelize models' location
const { sequelize } = require('../config/dbConnection');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { createToken } = require('../controllers/authController'); // Adjust the path to your actual file
require('dotenv').config();

const jwtSecret = process.env.JWTSECRET; // Ensure you are using the correct secret
const maxAge = 1 * 24 * 60 * 60; // Ensure you are using the correct max age for the token

describe('createToken function', () => {
  it('should generate a token that expires at the correct time', () => {
    const userId = 'tuser-id';
    const token = createToken(userId);

    // Verify the token and extract payload
    const decoded = jwt.verify(token, jwtSecret);

    // Check that the token contains the correct user id
    expect(decoded.id).toBe(userId);

    // Check that the token has the correct expiration time
    const expirationTimeInSeconds = Math.floor(Date.now() / 1000) + 24 * 60 * 60; // 1 day in seconds
    expect(decoded.exp).toBeCloseTo(expirationTimeInSeconds, -2); // Allow some leeway
  });

  it('should contain the correct user details in the token', () => {
    const userId = 'tuser-id';
    const token = createToken(userId);

    // Verify the token and extract payload
    const decoded = jwt.verify(token, jwtSecret);

    // Check that the token contains the correct user id
    expect(decoded.id).toBe(userId);
  });
});



// authentication routes

beforeAll(async () => {
    await sequelize.sync({ force: true }); // Clear the database before running tests
});

describe('POST /auth/register', () => {
    beforeEach(async () => {
        // Clear database or ensure a clean state before each test
        await User.destroy({ where: {} });
        await Organisation.destroy({ where: {} });
    });

    it('should register user successfully with default organisation', async () => {
        const userData = {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
            password: 'password123',
            phone: '0207821919'
        };

        const response = await request(app)
            .post('/auth/register')
            .send(userData)
            .expect(201);

        expect(response.body.status).toBe('Success');
        expect(response.body.message).toBe('Registration successful');
        expect(response.body.data.user.userId).toBeDefined();
        expect(response.body.data.user.firstName).toBe(userData.firstName);
        expect(response.body.data.user.lastName).toBe(userData.lastName);
        expect(response.body.data.user.email).toBe(userData.email);
        expect(response.body.data.user.phone).toBe(userData.phone);
        expect(response.body.data.accessToken).toBeDefined();

        // Additional verification
        const user = await User.findOne({ where: { email: userData.email } });
        const organisation = await Organisation.findOne({ where: { userId: user.userId } });

        expect(organisation).not.toBeNull();
        expect(organisation.name).toBe("John's Organisation");
    });

    it('should fail if required fields are missing', async () => {
        const missingFieldsTestCases = [
            {
                missingField: 'firstName',
                userData: {
                    lastName: 'Doe',
                    email: 'john.doe@example.com',
                    password: 'password123'
                },
                errorMessage: 'First name is required'
            },
            {
                missingField: 'lastName',
                userData: {
                    firstName: 'John',
                    email: 'john.doe@example.com',
                    password: 'password123'
                },
                errorMessage: 'Last name is required'
            },
            {
                missingField: 'email',
                userData: {
                    firstName: 'John',
                    lastName: 'Doe',
                    password: 'password123'
                },
                errorMessage: 'Email is required'
            },
            {
                missingField: 'password',
                userData: {
                    firstName: 'John',
                    lastName: 'Doe',
                    email: 'john.doe@example.com'
                },
                errorMessage: 'Password is required'
            }
        ];

        for (const testCase of missingFieldsTestCases) {
            const response = await request(app)
                .post('/auth/register')
                .send(testCase.userData)
                .expect(422);

            expect(response.body.status).toBe('Bad request');
            expect(response.body.message).toBe('Validation failed');
            expect(response.body.errors).toContainEqual({
                field: testCase.missingField,
                message: testCase.errorMessage
            });
        }
    });

  it('should fail if there is a duplicate email', async () => {
        const userData = {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
            password: 'password123',
            phone: '0207821919'
        };

        // Attempt to register a second user with the same email
        const response = await request(app)
            .post('/auth/register')
            .send(userData)
            .expect(422);

        expect(response.body).toHaveProperty('errors');
        expect(response.body.errors).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    field: 'email',
                    message: 'email must be unique'
                })
            ])
        );
    });
});

describe('POST /auth/login', () => {

    beforeAll(async () => {
        const salt = bcrypt.genSalt();
        const passwordHash = await bcrypt.hash('password123', salt);
        await User.create({
            firstName: 'Jane',
            lastName: 'Doe',
            email: 'jane.doe@example.com',
            password: 'password123',
            phone: '0987654321'
        });
    });

    it('should log the user in successfully', async () => {
        const res = await request(app)
            .post('/auth/login')
            .send({
                email: 'jane.doe@example.com',
                password: 'password123'
            });

        expect(res.statusCode).toEqual(200);
        expect(res.body.status).toEqual('Success');
        expect(res.body.message).toEqual('Login successful');
        expect(response.body.data.user.userId).toBeDefined();
        expect(response.body.data.user.firstName).toBe(userData.firstName);
        expect(response.body.data.user.lastName).toBe(userData.lastName);
        expect(response.body.data.user.email).toBe(userData.email);
        expect(response.body.data.user.phone).toBe(userData.phone);
        expect(response.body.data.accessToken).toBeDefined();
    });

    it('should fail to log the user in with incorrect password', async () => {
        const res = await request(app)
            .post('/auth/login')
            .send({
                email: 'jane.doe@example.com',
                password: 'wrongpassword'
            });

        expect(res.statusCode).toEqual(401);
        expect(res.body.status).toEqual('Bad request');
        expect(res.body.message).toEqual('Authentication failed');
    });

    it('should fail if email is missing', async () => {
      const loginData = {
          password: 'password123'
      };

      const response = await request(app)
          .post('/auth/login')
          .send(loginData)
          .expect(422);

      expect(response.body.status).toBe('Bad request');
      expect(response.body.message).toBe('Validation failed');
      expect(response.body.errors).toContainEqual({ field: 'email', message: 'Email and password are required' });
  });

  it('should fail if password is missing', async () => {
      const loginData = {
          email: 'john.doe@example.com'
      };

      const response = await request(app)
          .post('/auth/login')
          .send(loginData)
          .expect(422);

      expect(response.body.status).toBe('Bad request');
      expect(response.body.message).toBe('Validation failed');
      expect(response.body.errors).toContainEqual({ field: 'password', message: 'Email and password are required' });
  });

  it('should fail if both email and password are missing', async () => {
      const loginData = {};

      const response = await request(app)
          .post('/auth/login')
          .send(loginData)
          .expect(422);

      expect(response.body.status).toBe('Bad request');
      expect(response.body.message).toBe('Validation failed');
      expect(response.body.errors).toContainEqual({ field: 'email', message: 'Email and password are required' });
      expect(response.body.errors).toContainEqual({ field: 'password', message: 'Email and password are required' });
  });
  

});

afterAll(async () => {
    await sequelize.close(); // Close the database connection after all tests run
});


// test/organisation.spec.js

let user1, user2, org1, org2, token1, token2;

beforeAll(async () => {
    await sequelize.sync({ force: true });

    user1 = await User.create({ firstName: 'John', lastName: 'Doe', email: 'john@example.com', password: 'password' });
    user2 = await User.create({ firstName: 'Jane', lastName: 'Doe', email: 'jane@example.com', password: 'password' });

    org1 = await Organisation.create({ name: 'Org1', userId: user1.userId });
    org2 = await Organisation.create({ name: 'Org2', userId: user2.userId });

    token1 = jwt.sign({ id: user1.userId }, jwtSecret, { expiresIn: '1h' });
    token2 = jwt.sign({ id: user2.userId }, jwtSecret, { expiresIn: '1h' });
});

describe('Organisation Access', () => {
    it('should allow user1 to access their own organisation data', async () => {
        const res = await request(app)
            .get(`/api/organisations/${org1.orgId}`)
            .set('Authorization', `Bearer ${token1}`);
        
        expect(res.statusCode).toEqual(200);
        expect(res.body.data.name).toEqual('Org1');
    });

    it('should not allow user1 to access user2\'s organisation data', async () => {
        const res = await request(app)
            .get(`/api/organisations/${org2.orgId}`)
            .set('Authorization', `Bearer ${token1}`);
        
        expect(res.statusCode).toEqual(403);
        expect(res.body.message).toEqual('Forbidden');
    });

    it('should allow user2 to access their own organisation data', async () => {
        const res = await request(app)
            .get(`/api/organisations/${org2.orgId}`)
            .set('Authorization', `Bearer ${token2}`);
        
        expect(res.statusCode).toEqual(200);
        expect(res.body.data.name).toEqual('Org2');
    });

    it('should not allow user2 to access user1\'s organisation data', async () => {
        const res = await request(app)
            .get(`/api/organisations/${org1.orgId}`)
            .set('Authorization', `Bearer ${token2}`);
        
        expect(res.statusCode).toEqual(403);
        expect(res.body.message).toEqual('Forbidden');
    });
});

afterAll(async () => {
    await sequelize.close();
});
