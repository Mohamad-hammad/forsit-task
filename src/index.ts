import express, { Express } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import productApi from './api/product.api';
import inventoryApi from './api/inventory.api';
import saleApi from './api/sale.api';
import categoryApi from './api/category.api';
import seedingApi from './api/seeding.api';
import { AppDataSource } from './config/typeorm.config';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/products', productApi);
app.use('/api/inventory', inventoryApi);
app.use('/api/sales', saleApi);
app.use('/api/categories', categoryApi);
app.use('/api/seed', seedingApi);

AppDataSource.initialize()
    .then(() => {
        console.log('Database connected');
        app.listen(port, () => {
            console.log(`Server running on port ${port}`);
        });
    })
    .catch((error) => {
        console.error('Database connection failed:', error);
    });