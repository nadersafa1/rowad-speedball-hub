import { initContract } from '@ts-rest/core';
import { z } from 'zod';
import { insertPlayerSchema, selectPlayerSchema, insertTestSchema, selectTestSchema, insertTestResultSchema, selectTestResultSchema } from '../db/schema';

const c = initContract();

// Enhanced schemas with computed fields
const playerWithAgeSchema = selectPlayerSchema.extend({
  age: z.number(),
  ageGroup: z.string(),
});

const testResultWithTotalSchema = selectTestResultSchema.extend({
  totalScore: z.number(),
});

const testResultWithPlayerSchema = testResultWithTotalSchema.extend({
  player: playerWithAgeSchema.optional(),
});

const playerWithResultsSchema = playerWithAgeSchema.extend({
  testResults: z.array(testResultWithTotalSchema).optional(),
});

const testWithResultsSchema = selectTestSchema.extend({
  testResults: z.array(testResultWithPlayerSchema).optional(),
});

// API Contract
export const contract = c.router({
  // Players endpoints
  players: {
    getAll: {
      method: 'GET',
      path: '/api/players',
      responses: {
        200: z.array(playerWithAgeSchema),
      },
      query: z.object({
        search: z.string().optional(),
        gender: z.enum(['male', 'female']).optional(),
        ageGroup: z.string().optional(),
        page: z.string().optional(),
        limit: z.string().optional(),
      }).optional(),
    },
    getById: {
      method: 'GET',
      path: '/api/players/:id',
      responses: {
        200: playerWithResultsSchema,
        404: z.object({ message: z.string() }),
      },
      pathParams: z.object({
        id: z.string().uuid(),
      }),
    },
    create: {
      method: 'POST',
      path: '/api/players',
      responses: {
        201: playerWithAgeSchema,
        400: z.object({ message: z.string(), errors: z.array(z.string()).optional() }),
        401: z.object({ message: z.string() }),
      },
      body: insertPlayerSchema.omit({ id: true, createdAt: true, updatedAt: true }),
    },
    update: {
      method: 'PUT',
      path: '/api/players/:id',
      responses: {
        200: playerWithAgeSchema,
        400: z.object({ message: z.string(), errors: z.array(z.string()).optional() }),
        401: z.object({ message: z.string() }),
        404: z.object({ message: z.string() }),
      },
      pathParams: z.object({
        id: z.string().uuid(),
      }),
      body: insertPlayerSchema.omit({ id: true, createdAt: true, updatedAt: true }).partial(),
    },
    delete: {
      method: 'DELETE',
      path: '/api/players/:id',
      responses: {
        200: z.object({ message: z.string() }),
        401: z.object({ message: z.string() }),
        404: z.object({ message: z.string() }),
      },
      pathParams: z.object({
        id: z.string().uuid(),
      }),
    },
  },

  // Tests endpoints
  tests: {
    getAll: {
      method: 'GET',
      path: '/api/tests',
      responses: {
        200: z.array(selectTestSchema),
      },
      query: z.object({
        testType: z.enum(['60_30', '30_30', '30_60']).optional(),
        dateFrom: z.string().optional(),
        dateTo: z.string().optional(),
        page: z.string().optional(),
        limit: z.string().optional(),
      }).optional(),
    },
    getById: {
      method: 'GET',
      path: '/api/tests/:id',
      responses: {
        200: testWithResultsSchema,
        404: z.object({ message: z.string() }),
      },
      pathParams: z.object({
        id: z.string().uuid(),
      }),
      query: z.object({
        includeResults: z.string().optional(),
        gender: z.enum(['male', 'female']).optional(),
        ageGroup: z.string().optional(),
        yearOfBirth: z.string().optional(),
      }).optional(),
    },
    create: {
      method: 'POST',
      path: '/api/tests',
      responses: {
        201: selectTestSchema,
        400: z.object({ message: z.string(), errors: z.array(z.string()).optional() }),
        401: z.object({ message: z.string() }),
      },
      body: insertTestSchema.omit({ id: true, createdAt: true, updatedAt: true }),
    },
    update: {
      method: 'PUT',
      path: '/api/tests/:id',
      responses: {
        200: selectTestSchema,
        400: z.object({ message: z.string(), errors: z.array(z.string()).optional() }),
        401: z.object({ message: z.string() }),
        404: z.object({ message: z.string() }),
      },
      pathParams: z.object({
        id: z.string().uuid(),
      }),
      body: insertTestSchema.omit({ id: true, createdAt: true, updatedAt: true }).partial(),
    },
    delete: {
      method: 'DELETE',
      path: '/api/tests/:id',
      responses: {
        200: z.object({ message: z.string() }),
        401: z.object({ message: z.string() }),
        404: z.object({ message: z.string() }),
      },
      pathParams: z.object({
        id: z.string().uuid(),
      }),
    },
  },

  // Test Results endpoints
  results: {
    getAll: {
      method: 'GET',
      path: '/api/results',
      responses: {
        200: z.array(testResultWithTotalSchema),
      },
      query: z.object({
        playerId: z.string().uuid().optional(),
        testId: z.string().uuid().optional(),
        page: z.string().optional(),
        limit: z.string().optional(),
      }).optional(),
    },
    getByPlayer: {
      method: 'GET',
      path: '/api/results/player/:id',
      responses: {
        200: z.array(testResultWithTotalSchema),
        404: z.object({ message: z.string() }),
      },
      pathParams: z.object({
        id: z.string().uuid(),
      }),
    },
    getByTest: {
      method: 'GET',
      path: '/api/results/test/:id',
      responses: {
        200: z.array(testResultWithPlayerSchema),
        404: z.object({ message: z.string() }),
      },
      pathParams: z.object({
        id: z.string().uuid(),
      }),
    },
    create: {
      method: 'POST',
      path: '/api/results',
      responses: {
        201: testResultWithTotalSchema,
        400: z.object({ message: z.string(), errors: z.array(z.string()).optional() }),
        401: z.object({ message: z.string() }),
      },
      body: insertTestResultSchema.omit({ id: true, createdAt: true, updatedAt: true }),
    },
    update: {
      method: 'PUT',
      path: '/api/results/:id',
      responses: {
        200: testResultWithTotalSchema,
        400: z.object({ message: z.string(), errors: z.array(z.string()).optional() }),
        401: z.object({ message: z.string() }),
        404: z.object({ message: z.string() }),
      },
      pathParams: z.object({
        id: z.string().uuid(),
      }),
      body: insertTestResultSchema.omit({ id: true, createdAt: true, updatedAt: true }).partial(),
    },
    delete: {
      method: 'DELETE',
      path: '/api/results/:id',
      responses: {
        200: z.object({ message: z.string() }),
        401: z.object({ message: z.string() }),
        404: z.object({ message: z.string() }),
      },
      pathParams: z.object({
        id: z.string().uuid(),
      }),
    },
  },

  // Auth endpoints
  auth: {
    login: {
      method: 'POST',
      path: '/api/auth/login',
      responses: {
        200: z.object({ message: z.string(), user: z.object({ email: z.string() }) }),
        401: z.object({ message: z.string() }),
        400: z.object({ message: z.string() }),
      },
      body: z.object({
        email: z.string().email(),
        password: z.string().min(1),
      }),
    },
    logout: {
      method: 'POST',
      path: '/api/auth/logout',
      responses: {
        200: z.object({ message: z.string() }),
      },
      body: z.object({}),
    },
    verify: {
      method: 'GET',
      path: '/api/auth/verify',
      responses: {
        200: z.object({ authenticated: z.boolean(), user: z.object({ email: z.string() }).optional() }),
      },
    },
  },
});
