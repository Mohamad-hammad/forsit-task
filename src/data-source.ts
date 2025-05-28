import { DataSource } from "typeorm";
import dotenv from "dotenv";
import { Category } from "./entities/Category";
import { Inventory } from "./entities/Inventory";
import { Product } from "./entities/Product";
import { Sale } from "./entities/Sale";

dotenv.config();

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || "5432"),
  username: process.env.DB_USER || "",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "",
  synchronize: true,
  logging: false,
  entities: [Category, Inventory, Product, Sale],
  migrations: [],
  subscribers: [],
});
