import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const NEON_DATABASE_URL =
  "postgresql://neondb_owner:npg_0UksdoLt8rYn@ep-falling-hall-b5f8fn28-pooler.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require";

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL || NEON_DATABASE_URL,
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
