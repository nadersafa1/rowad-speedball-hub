import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import session from 'express-session';
import rateLimit from 'express-rate-limit';
import { config } from 'dotenv';
import { createExpressEndpoints, initServer } from '@ts-rest/express';
import { contract } from './types/api';
import { requireAuth, AuthenticatedRequest } from './middleware/auth';
import * as authHandlers from './routes/auth';
import { db } from './db/connection';
import { players, tests, testResults, calculateAge, getAgeGroup, calculateTotalScore } from './db/schema';
import { eq, and, sql, like, desc } from 'drizzle-orm';

// Load environment variables
config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "fonts.googleapis.com"],
      fontSrc: ["'self'", "fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://rowad.speedballhub.com', 'http://localhost:3000']
    : ['http://localhost:3000'],
  credentials: true,
}));

app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  },
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Create ts-rest server
const s = initServer().router(contract, {
  // Players endpoints
  players: {
    getAll: async ({ query }) => {
      try {
        const page = parseInt(query?.page || '1');
        const limit = Math.min(parseInt(query?.limit || '50'), 100);
        const offset = (page - 1) * limit;

        let whereConditions = [];
        
        if (query?.search) {
          whereConditions.push(like(players.name, `%${query.search}%`));
        }
        
        if (query?.gender) {
          whereConditions.push(eq(players.gender, query.gender));
        }

        const result = await db
          .select()
          .from(players)
          .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
          .orderBy(desc(players.createdAt))
          .limit(limit)
          .offset(offset);

        const playersWithAge = result.map(player => ({
          ...player,
          age: calculateAge(player.dateOfBirth),
          ageGroup: getAgeGroup(player.dateOfBirth),
        }));

        // Filter by age group if provided
        const filteredPlayers = query?.ageGroup 
          ? playersWithAge.filter(player => player.ageGroup === query.ageGroup)
          : playersWithAge;

        return { status: 200, body: filteredPlayers };
      } catch (error) {
        console.error('Error fetching players:', error);
        return { status: 500, body: { message: 'Internal server error' } };
      }
    },

    getById: async ({ params }) => {
      try {
        const player = await db
          .select()
          .from(players)
          .where(eq(players.id, params.id))
          .limit(1);

        if (player.length === 0) {
          return { status: 404, body: { message: 'Player not found' } };
        }

        const playerResults = await db
          .select()
          .from(testResults)
          .where(eq(testResults.playerId, params.id))
          .orderBy(desc(testResults.createdAt));

        const resultsWithTotal = playerResults.map(result => ({
          ...result,
          totalScore: calculateTotalScore(result),
        }));

        const playerWithAge = {
          ...player[0],
          age: calculateAge(player[0].dateOfBirth),
          ageGroup: getAgeGroup(player[0].dateOfBirth),
          testResults: resultsWithTotal,
        };

        return { status: 200, body: playerWithAge };
      } catch (error) {
        console.error('Error fetching player:', error);
        return { status: 500, body: { message: 'Internal server error' } };
      }
    },

    create: async ({ body }, { req }: { req: AuthenticatedRequest }) => {
      if (!req.session?.user) {
        return { status: 401, body: { message: 'Authentication required' } };
      }

      try {
        const result = await db
          .insert(players)
          .values({
            ...body,
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .returning();

        const playerWithAge = {
          ...result[0],
          age: calculateAge(result[0].dateOfBirth),
          ageGroup: getAgeGroup(result[0].dateOfBirth),
        };

        return { status: 201, body: playerWithAge };
      } catch (error) {
        console.error('Error creating player:', error);
        return { status: 500, body: { message: 'Internal server error' } };
      }
    },

    update: async ({ params, body }, { req }: { req: AuthenticatedRequest }) => {
      if (!req.session?.user) {
        return { status: 401, body: { message: 'Authentication required' } };
      }

      try {
        const result = await db
          .update(players)
          .set({
            ...body,
            updatedAt: new Date(),
          })
          .where(eq(players.id, params.id))
          .returning();

        if (result.length === 0) {
          return { status: 404, body: { message: 'Player not found' } };
        }

        const playerWithAge = {
          ...result[0],
          age: calculateAge(result[0].dateOfBirth),
          ageGroup: getAgeGroup(result[0].dateOfBirth),
        };

        return { status: 200, body: playerWithAge };
      } catch (error) {
        console.error('Error updating player:', error);
        return { status: 500, body: { message: 'Internal server error' } };
      }
    },

    delete: async ({ params }, { req }: { req: AuthenticatedRequest }) => {
      if (!req.session?.user) {
        return { status: 401, body: { message: 'Authentication required' } };
      }

      try {
        const result = await db
          .delete(players)
          .where(eq(players.id, params.id))
          .returning();

        if (result.length === 0) {
          return { status: 404, body: { message: 'Player not found' } };
        }

        return { status: 200, body: { message: 'Player deleted successfully' } };
      } catch (error) {
        console.error('Error deleting player:', error);
        return { status: 500, body: { message: 'Internal server error' } };
      }
    },
  },

  // Tests endpoints
  tests: {
    getAll: async ({ query }) => {
      try {
        const page = parseInt(query?.page || '1');
        const limit = Math.min(parseInt(query?.limit || '50'), 100);
        const offset = (page - 1) * limit;

        let whereConditions = [];
        
        if (query?.testType) {
          whereConditions.push(eq(tests.testType, query.testType));
        }

        const result = await db
          .select()
          .from(tests)
          .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
          .orderBy(desc(tests.dateConducted))
          .limit(limit)
          .offset(offset);

        return { status: 200, body: result };
      } catch (error) {
        console.error('Error fetching tests:', error);
        return { status: 500, body: { message: 'Internal server error' } };
      }
    },

    getById: async ({ params, query }) => {
      try {
        const test = await db
          .select()
          .from(tests)
          .where(eq(tests.id, params.id))
          .limit(1);

        if (test.length === 0) {
          return { status: 404, body: { message: 'Test not found' } };
        }

        if (query?.includeResults === 'true') {
          const results = await db
            .select({
              testResult: testResults,
              player: players,
            })
            .from(testResults)
            .leftJoin(players, eq(testResults.playerId, players.id))
            .where(eq(testResults.testId, params.id));

          const resultsWithTotal = results.map(({ testResult, player }) => ({
            ...testResult,
            totalScore: calculateTotalScore(testResult),
            player: player ? {
              ...player,
              age: calculateAge(player.dateOfBirth),
              ageGroup: getAgeGroup(player.dateOfBirth),
            } : undefined,
          }));

          // Apply filters
          let filteredResults = resultsWithTotal;
          
          if (query?.gender && filteredResults[0]?.player) {
            filteredResults = filteredResults.filter(result => 
              result.player && result.player.gender === query.gender
            );
          }

          if (query?.ageGroup && filteredResults[0]?.player) {
            filteredResults = filteredResults.filter(result => 
              result.player && getAgeGroup(result.player.dateOfBirth) === query.ageGroup
            );
          }

          const testWithResults = {
            ...test[0],
            testResults: filteredResults,
          };

          return { status: 200, body: testWithResults };
        }

        return { status: 200, body: test[0] };
      } catch (error) {
        console.error('Error fetching test:', error);
        return { status: 500, body: { message: 'Internal server error' } };
      }
    },

    create: async ({ body }, { req }: { req: AuthenticatedRequest }) => {
      if (!req.session?.user) {
        return { status: 401, body: { message: 'Authentication required' } };
      }

      try {
        const result = await db
          .insert(tests)
          .values({
            ...body,
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .returning();

        return { status: 201, body: result[0] };
      } catch (error) {
        console.error('Error creating test:', error);
        return { status: 500, body: { message: 'Internal server error' } };
      }
    },

    update: async ({ params, body }, { req }: { req: AuthenticatedRequest }) => {
      if (!req.session?.user) {
        return { status: 401, body: { message: 'Authentication required' } };
      }

      try {
        const result = await db
          .update(tests)
          .set({
            ...body,
            updatedAt: new Date(),
          })
          .where(eq(tests.id, params.id))
          .returning();

        if (result.length === 0) {
          return { status: 404, body: { message: 'Test not found' } };
        }

        return { status: 200, body: result[0] };
      } catch (error) {
        console.error('Error updating test:', error);
        return { status: 500, body: { message: 'Internal server error' } };
      }
    },

    delete: async ({ params }, { req }: { req: AuthenticatedRequest }) => {
      if (!req.session?.user) {
        return { status: 401, body: { message: 'Authentication required' } };
      }

      try {
        const result = await db
          .delete(tests)
          .where(eq(tests.id, params.id))
          .returning();

        if (result.length === 0) {
          return { status: 404, body: { message: 'Test not found' } };
        }

        return { status: 200, body: { message: 'Test deleted successfully' } };
      } catch (error) {
        console.error('Error deleting test:', error);
        return { status: 500, body: { message: 'Internal server error' } };
      }
    },
  },

  // Results endpoints (simplified implementation)
  results: {
    getAll: async ({ query }) => {
      try {
        const page = parseInt(query?.page || '1');
        const limit = Math.min(parseInt(query?.limit || '50'), 100);
        const offset = (page - 1) * limit;

        const result = await db
          .select()
          .from(testResults)
          .limit(limit)
          .offset(offset);

        const resultsWithTotal = result.map(result => ({
          ...result,
          totalScore: calculateTotalScore(result),
        }));

        return { status: 200, body: resultsWithTotal };
      } catch (error) {
        console.error('Error fetching results:', error);
        return { status: 500, body: { message: 'Internal server error' } };
      }
    },

    getByPlayer: async ({ params }) => {
      try {
        const result = await db
          .select()
          .from(testResults)
          .where(eq(testResults.playerId, params.id));

        const resultsWithTotal = result.map(result => ({
          ...result,
          totalScore: calculateTotalScore(result),
        }));

        return { status: 200, body: resultsWithTotal };
      } catch (error) {
        console.error('Error fetching player results:', error);
        return { status: 500, body: { message: 'Internal server error' } };
      }
    },

    getByTest: async ({ params }) => {
      try {
        const result = await db
          .select({
            testResult: testResults,
            player: players,
          })
          .from(testResults)
          .leftJoin(players, eq(testResults.playerId, players.id))
          .where(eq(testResults.testId, params.id));

        const resultsWithTotal = result.map(({ testResult, player }) => ({
          ...testResult,
          totalScore: calculateTotalScore(testResult),
          player: player ? {
            ...player,
            age: calculateAge(player.dateOfBirth),
            ageGroup: getAgeGroup(player.dateOfBirth),
          } : undefined,
        }));

        return { status: 200, body: resultsWithTotal };
      } catch (error) {
        console.error('Error fetching test results:', error);
        return { status: 500, body: { message: 'Internal server error' } };
      }
    },

    create: async ({ body }, { req }: { req: AuthenticatedRequest }) => {
      if (!req.session?.user) {
        return { status: 401, body: { message: 'Authentication required' } };
      }

      try {
        const result = await db
          .insert(testResults)
          .values({
            ...body,
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .returning();

        const resultWithTotal = {
          ...result[0],
          totalScore: calculateTotalScore(result[0]),
        };

        return { status: 201, body: resultWithTotal };
      } catch (error) {
        console.error('Error creating test result:', error);
        return { status: 500, body: { message: 'Internal server error' } };
      }
    },

    update: async ({ params, body }, { req }: { req: AuthenticatedRequest }) => {
      if (!req.session?.user) {
        return { status: 401, body: { message: 'Authentication required' } };
      }

      try {
        const result = await db
          .update(testResults)
          .set({
            ...body,
            updatedAt: new Date(),
          })
          .where(eq(testResults.id, params.id))
          .returning();

        if (result.length === 0) {
          return { status: 404, body: { message: 'Test result not found' } };
        }

        const resultWithTotal = {
          ...result[0],
          totalScore: calculateTotalScore(result[0]),
        };

        return { status: 200, body: resultWithTotal };
      } catch (error) {
        console.error('Error updating test result:', error);
        return { status: 500, body: { message: 'Internal server error' } };
      }
    },

    delete: async ({ params }, { req }: { req: AuthenticatedRequest }) => {
      if (!req.session?.user) {
        return { status: 401, body: { message: 'Authentication required' } };
      }

      try {
        const result = await db
          .delete(testResults)
          .where(eq(testResults.id, params.id))
          .returning();

        if (result.length === 0) {
          return { status: 404, body: { message: 'Test result not found' } };
        }

        return { status: 200, body: { message: 'Test result deleted successfully' } };
      } catch (error) {
        console.error('Error deleting test result:', error);
        return { status: 500, body: { message: 'Internal server error' } };
      }
    },
  },

  // Auth endpoints
  auth: {
    login: authHandlers.login,
    logout: authHandlers.logout,
    verify: authHandlers.verify,
  },
});

createExpressEndpoints(contract, s, app);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});
