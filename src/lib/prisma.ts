import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Supabase's pooler cert isn't in Node's default trust store; "require" now
// maps to strict verify-full (see pg-connection-string), so downgrade to
// no-verify explicitly instead of failing the TLS handshake.
const connectionString = (process.env.DATABASE_URL ?? "").replace(
  "sslmode=require",
  "sslmode=no-verify"
);

const adapter = new PrismaPg({ connectionString });

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
