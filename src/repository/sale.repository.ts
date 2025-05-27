import { AppDataSource } from '../config/typeorm.config'
import { Sale } from '../entities/Sale'
import { Between, FindOptionsWhere } from 'typeorm'

export class SaleRepository {
    private repository = AppDataSource.getRepository(Sale)

    async createSale(sale: Omit<Sale, 'id' | 'created_at' | 'product'>) {
        const newSale = this.repository.create(sale)
        return await this.repository.save(newSale)
    }

    async getSales(filters: {
        startDate?: string;
        endDate?: string;
        productId?: string;
        categoryId?: string;
        page?: number;
        limit?: number;
    }) {
        const where: FindOptionsWhere<Sale> = {}

        if (filters.startDate && filters.endDate) {
            where.sale_date = Between(new Date(filters.startDate), new Date(filters.endDate))
        } else if (filters.startDate) {
            where.sale_date = Between(new Date(filters.startDate), new Date())
        } else if (filters.endDate) {
            where.sale_date = Between(new Date('1970-01-01'), new Date(filters.endDate))
        }

        if (filters.productId) {
            where.product_id = filters.productId
        }

        const queryBuilder = this.repository
            .createQueryBuilder('sale')
            .leftJoinAndSelect('sale.product', 'product')
            .leftJoinAndSelect('product.categoryRelation', 'category')
            .where(where)

        if (filters.categoryId) {
            queryBuilder.andWhere('category.id = :categoryId', { categoryId: filters.categoryId })
        }

        const total = await queryBuilder.getCount()

        if (filters.page && filters.limit) {
            const skip = (filters.page - 1) * filters.limit
            queryBuilder
                .skip(skip)
                .take(filters.limit)
        }

        queryBuilder.orderBy('sale.sale_date', 'DESC')

        const data = await queryBuilder.getMany()

        return {
            data,
            metadata: {
                total,
                page: filters.page,
                limit: filters.limit,
                totalPages: filters.limit ? Math.ceil(total / filters.limit) : undefined
            }
        }
    }

    async getDailyRevenue(filters: {
        startDate?: string;
        endDate?: string;
        productId?: string;
        categoryId?: string;
    }) {
        const queryBuilder = this.repository
            .createQueryBuilder('sale')
            .select('DATE_TRUNC(\'day\', sale.sale_date)', 'date')
            .addSelect('SUM(sale.total_amount)', 'revenue')
            .addSelect('COUNT(sale.id)', 'total_sales')
            .addSelect('AVG(sale.total_amount)', 'average_order_value')
            .addSelect('SUM(sale.quantity)', 'total_quantity')

        if (filters.startDate && filters.endDate) {
            queryBuilder.where('sale.sale_date BETWEEN :startDate AND :endDate', {
                startDate: new Date(filters.startDate),
                endDate: new Date(filters.endDate)
            })
        } else if (filters.startDate) {
            queryBuilder.where('sale.sale_date >= :startDate', {
                startDate: new Date(filters.startDate)
            })
        } else if (filters.endDate) {
            queryBuilder.where('sale.sale_date <= :endDate', {
                endDate: new Date(filters.endDate)
            })
        }

        if (filters.productId) {
            queryBuilder.andWhere('sale.product_id = :productId', { productId: filters.productId })
        }

        if (filters.categoryId) {
            queryBuilder
                .leftJoin('sale.product', 'product')
                .leftJoin('product.categoryRelation', 'category')
                .andWhere('category.id = :categoryId', { categoryId: filters.categoryId })
        }

        queryBuilder
            .groupBy('DATE_TRUNC(\'day\', sale.sale_date)')
            .orderBy('date', 'DESC')

        const results = await queryBuilder.getRawMany()

        return results.map(result => ({
            date: new Date(result.date).toISOString().split('T')[0],
            revenue: Number(result.revenue) || 0,
            total_sales: Number(result.total_sales) || 0,
            average_order_value: Number(result.average_order_value) || 0,
            total_quantity: Number(result.total_quantity) || 0
        }))
    }

    async getWeeklyRevenue(filters: {
        startDate?: string;
        endDate?: string;
        productId?: string;
        categoryId?: string;
    }) {
        const queryBuilder = this.repository
            .createQueryBuilder('sale')
            .select('DATE_TRUNC(\'week\', sale.sale_date)', 'week_start')
            .addSelect('DATE_TRUNC(\'week\', sale.sale_date) + INTERVAL \'6 days\'', 'week_end')
            .addSelect('SUM(sale.total_amount)', 'revenue')
            .addSelect('COUNT(sale.id)', 'total_sales')
            .addSelect('AVG(sale.total_amount)', 'average_order_value')
            .addSelect('SUM(sale.quantity)', 'total_quantity')
            .addSelect('COUNT(DISTINCT DATE(sale.sale_date))', 'days_with_sales')

        if (filters.startDate && filters.endDate) {
            queryBuilder.where('sale.sale_date BETWEEN :startDate AND :endDate', {
                startDate: new Date(filters.startDate),
                endDate: new Date(filters.endDate)
            })
        } else if (filters.startDate) {
            queryBuilder.where('sale.sale_date >= :startDate', {
                startDate: new Date(filters.startDate)
            })
        } else if (filters.endDate) {
            queryBuilder.where('sale.sale_date <= :endDate', {
                endDate: new Date(filters.endDate)
            })
        }

        if (filters.productId) {
            queryBuilder.andWhere('sale.product_id = :productId', { productId: filters.productId })
        }

        if (filters.categoryId) {
            queryBuilder
                .leftJoin('sale.product', 'product')
                .leftJoin('product.categoryRelation', 'category')
                .andWhere('category.id = :categoryId', { categoryId: filters.categoryId })
        }

        queryBuilder
            .groupBy('DATE_TRUNC(\'week\', sale.sale_date)')
            .orderBy('week_start', 'DESC')

        const results = await queryBuilder.getRawMany()

        return results.map(result => ({
            week_start: new Date(result.week_start).toISOString().split('T')[0],
            week_end: new Date(result.week_end).toISOString().split('T')[0],
            revenue: Number(result.revenue) || 0,
            total_sales: Number(result.total_sales) || 0,
            average_order_value: Number(result.average_order_value) || 0,
            total_quantity: Number(result.total_quantity) || 0,
            days_with_sales: Number(result.days_with_sales) || 0
        }))
    }

    async getMonthlyRevenue(filters: {
        startDate?: string;
        endDate?: string;
        productId?: string;
        categoryId?: string;
    }) {
        const queryBuilder = this.repository
            .createQueryBuilder('sale')
            .select('DATE_TRUNC(\'month\', sale.sale_date)', 'month_start')
            .addSelect('DATE_TRUNC(\'month\', sale.sale_date) + INTERVAL \'1 month - 1 day\'', 'month_end')
            .addSelect('SUM(sale.total_amount)', 'revenue')
            .addSelect('COUNT(sale.id)', 'total_sales')
            .addSelect('AVG(sale.total_amount)', 'average_order_value')
            .addSelect('SUM(sale.quantity)', 'total_quantity')
            .addSelect('COUNT(DISTINCT DATE(sale.sale_date))', 'days_with_sales')

        if (filters.startDate && filters.endDate) {
            queryBuilder.where('sale.sale_date BETWEEN :startDate AND :endDate', {
                startDate: new Date(filters.startDate),
                endDate: new Date(filters.endDate)
            })
        } else if (filters.startDate) {
            queryBuilder.where('sale.sale_date >= :startDate', {
                startDate: new Date(filters.startDate)
            })
        } else if (filters.endDate) {
            queryBuilder.where('sale.sale_date <= :endDate', {
                endDate: new Date(filters.endDate)
            })
        }

        if (filters.productId) {
            queryBuilder.andWhere('sale.product_id = :productId', { productId: filters.productId })
        }

        if (filters.categoryId) {
            queryBuilder
                .leftJoin('sale.product', 'product')
                .leftJoin('product.categoryRelation', 'category')
                .andWhere('category.id = :categoryId', { categoryId: filters.categoryId })
        }

        queryBuilder
            .groupBy('DATE_TRUNC(\'month\', sale.sale_date)')
            .orderBy('month_start', 'DESC')

        const results = await queryBuilder.getRawMany()

        return results.map(result => ({
            month_start: new Date(result.month_start).toISOString().split('T')[0],
            month_end: new Date(result.month_end).toISOString().split('T')[0],
            revenue: Number(result.revenue) || 0,
            total_sales: Number(result.total_sales) || 0,
            average_order_value: Number(result.average_order_value) || 0,
            total_quantity: Number(result.total_quantity) || 0,
            days_with_sales: Number(result.days_with_sales) || 0
        }))
    }

    async getAnnualRevenue(filters: {
        startDate?: string;
        endDate?: string;
        productId?: string;
        categoryId?: string;
    }) {
        const queryBuilder = this.repository
            .createQueryBuilder('sale')
            .select('DATE_TRUNC(\'year\', sale.sale_date)', 'year_start')
            .addSelect('DATE_TRUNC(\'year\', sale.sale_date) + INTERVAL \'1 year - 1 day\'', 'year_end')
            .addSelect('SUM(sale.total_amount)', 'revenue')
            .addSelect('COUNT(sale.id)', 'total_sales')
            .addSelect('AVG(sale.total_amount)', 'average_order_value')
            .addSelect('SUM(sale.quantity)', 'total_quantity')
            .addSelect('COUNT(DISTINCT DATE(sale.sale_date))', 'days_with_sales')
            .addSelect('COUNT(DISTINCT DATE_TRUNC(\'month\', sale.sale_date))', 'months_with_sales')

        if (filters.startDate && filters.endDate) {
            queryBuilder.where('sale.sale_date BETWEEN :startDate AND :endDate', {
                startDate: new Date(filters.startDate),
                endDate: new Date(filters.endDate)
            })
        } else if (filters.startDate) {
            queryBuilder.where('sale.sale_date >= :startDate', {
                startDate: new Date(filters.startDate)
            })
        } else if (filters.endDate) {
            queryBuilder.where('sale.sale_date <= :endDate', {
                endDate: new Date(filters.endDate)
            })
        }

        if (filters.productId) {
            queryBuilder.andWhere('sale.product_id = :productId', { productId: filters.productId })
        }

        if (filters.categoryId) {
            queryBuilder
                .leftJoin('sale.product', 'product')
                .leftJoin('product.categoryRelation', 'category')
                .andWhere('category.id = :categoryId', { categoryId: filters.categoryId })
        }

        queryBuilder
            .groupBy('DATE_TRUNC(\'year\', sale.sale_date)')
            .orderBy('year_start', 'DESC')

        const results = await queryBuilder.getRawMany()

        return results.map(result => ({
            year_start: new Date(result.year_start).toISOString().split('T')[0],
            year_end: new Date(result.year_end).toISOString().split('T')[0],
            revenue: Number(result.revenue) || 0,
            total_sales: Number(result.total_sales) || 0,
            average_order_value: Number(result.average_order_value) || 0,
            total_quantity: Number(result.total_quantity) || 0,
            days_with_sales: Number(result.days_with_sales) || 0,
            months_with_sales: Number(result.months_with_sales) || 0
        }))
    }
} 