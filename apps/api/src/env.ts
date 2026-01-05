import dotenv from 'dotenv';
dotenv.config();

export const env = {
  port: Number(process.env.PORT) || 4000,
  jwtSecret: process.env.JWT_SECRET || 'secret',
  refreshSecret: process.env.REFRESH_SECRET || 'refresh',
  databaseUrl: process.env.DATABASE_URL || ''
};
