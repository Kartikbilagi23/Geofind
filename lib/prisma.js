import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client';
import dotenv from "dotenv"
dotenv.config();

console.log(process.env.DATABASE_URL)

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

export default prisma;