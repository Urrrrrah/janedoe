import { PrismaClient } from "@/app/generated/prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
const globalForPrisma = global as unknown as {
    prisma: PrismaClient;
};
const adapter = new PrismaMariaDb({
    user: "root",
    password: "qwertyuiop123",
    host: "localhost",
    port: 3306,
    database: "gyomu_sys",
    connectionLimit: 5,
    allowPublicKeyRetrieval: true,
});
export const prisma =
    globalForPrisma.prisma ||
    new PrismaClient({
        adapter,
    });
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// export default prisma;