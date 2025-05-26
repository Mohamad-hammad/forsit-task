import { DataSource } from "typeorm";
import dotenv from "dotenv";
import { Product } from "../entities/Product";
import { Inventory } from "../entities/Inventory";
import { Sale } from "../entities/Sale";
import { Category } from "../entities/Category";
dotenv.config();

if (!process.env.SUPABASE_DB_URL) {
    throw new Error('Missing SUPABASE_DB_URL environment variable')
}

export const AppDataSource = new DataSource({
    type: "postgres",
    url: process.env.SUPABASE_DB_URL,
    ssl: {
        rejectUnauthorized: false
    },
    entities: [Product, Inventory, Sale, Category],
    synchronize: true,
    logging: true,
});