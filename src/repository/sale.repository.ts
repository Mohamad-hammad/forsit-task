import { Sale } from '../entities/Sale'
import { Between, FindOptionsWhere } from 'typeorm'
import { AppDataSource } from '../data-source'

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

    async compareRevenue(filters: {
        period1Start: string;
        period1End: string;
        period2Start: string;
        period2End: string;
        productId?: string;
        categoryId?: string;
    }) {
        const period1Query = this.repository
            .createQueryBuilder('sale')
            .select('SUM(sale.total_amount)', 'revenue')
            .addSelect('COUNT(sale.id)', 'total_sales')
            .addSelect('AVG(sale.total_amount)', 'average_order_value')
            .addSelect('SUM(sale.quantity)', 'total_quantity')
            .addSelect('COUNT(DISTINCT DATE(sale.sale_date))', 'days_with_sales')
            .where('sale.sale_date BETWEEN :period1Start AND :period1End', {
                period1Start: new Date(filters.period1Start),
                period1End: new Date(filters.period1End)
            })

        const period2Query = this.repository
            .createQueryBuilder('sale')
            .select('SUM(sale.total_amount)', 'revenue')
            .addSelect('COUNT(sale.id)', 'total_sales')
            .addSelect('AVG(sale.total_amount)', 'average_order_value')
            .addSelect('SUM(sale.quantity)', 'total_quantity')
            .addSelect('COUNT(DISTINCT DATE(sale.sale_date))', 'days_with_sales')
            .where('sale.sale_date BETWEEN :period2Start AND :period2End', {
                period2Start: new Date(filters.period2Start),
                period2End: new Date(filters.period2End)
            })

        if (filters.productId) {
            period1Query.andWhere('sale.product_id = :productId', { productId: filters.productId })
            period2Query.andWhere('sale.product_id = :productId', { productId: filters.productId })
        }

        if (filters.categoryId) {
            period1Query
                .leftJoin('sale.product', 'product')
                .leftJoin('product.categoryRelation', 'category')
                .andWhere('category.id = :categoryId', { categoryId: filters.categoryId })
            period2Query
                .leftJoin('sale.product', 'product')
                .leftJoin('product.categoryRelation', 'category')
                .andWhere('category.id = :categoryId', { categoryId: filters.categoryId })
        }

        const [period1Data, period2Data] = await Promise.all([
            period1Query.getRawOne(),
            period2Query.getRawOne()
        ])

        const calculatePercentageChange = (current: number, previous: number) => {
            if (previous === 0) return current > 0 ? 100 : 0
            return ((current - previous) / previous) * 100
        }

        return {
            period1: {
                start_date: filters.period1Start,
                end_date: filters.period1End,
                revenue: Number(period1Data?.revenue) || 0,
                total_sales: Number(period1Data?.total_sales) || 0,
                average_order_value: Number(period1Data?.average_order_value) || 0,
                total_quantity: Number(period1Data?.total_quantity) || 0,
                days_with_sales: Number(period1Data?.days_with_sales) || 0
            },
            period2: {
                start_date: filters.period2Start,
                end_date: filters.period2End,
                revenue: Number(period2Data?.revenue) || 0,
                total_sales: Number(period2Data?.total_sales) || 0,
                average_order_value: Number(period2Data?.average_order_value) || 0,
                total_quantity: Number(period2Data?.total_quantity) || 0,
                days_with_sales: Number(period2Data?.days_with_sales) || 0
            },
            comparison: {
                revenue_change: calculatePercentageChange(
                    Number(period2Data?.revenue) || 0,
                    Number(period1Data?.revenue) || 0
                ),
                sales_change: calculatePercentageChange(
                    Number(period2Data?.total_sales) || 0,
                    Number(period1Data?.total_sales) || 0
                ),
                average_order_value_change: calculatePercentageChange(
                    Number(period2Data?.average_order_value) || 0,
                    Number(period1Data?.average_order_value) || 0
                ),
                quantity_change: calculatePercentageChange(
                    Number(period2Data?.total_quantity) || 0,
                    Number(period1Data?.total_quantity) || 0
                ),
                days_with_sales_change: calculatePercentageChange(
                    Number(period2Data?.days_with_sales) || 0,
                    Number(period1Data?.days_with_sales) || 0
                )
            }
        }
    }

    async compareCategoryRevenue(filters: {
        startDate?: string;
        endDate?: string;
        categoryIds?: string[];
    }) {
        const queryBuilder = this.repository
            .createQueryBuilder('sale')
            .leftJoin('sale.product', 'product')
            .leftJoin('product.categoryRelation', 'category')
            .select('category.id', 'category_id')
            .addSelect('category.name', 'category_name')
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

        if (filters.categoryIds && filters.categoryIds.length > 0) {
            queryBuilder.andWhere('category.id IN (:...categoryIds)', { categoryIds: filters.categoryIds })
        }

        queryBuilder
            .groupBy('category.id')
            .addGroupBy('category.name')
            .orderBy('revenue', 'DESC')

        const results = await queryBuilder.getRawMany()

        const totalRevenue = results.reduce((sum, category) => sum + Number(category.revenue || 0), 0)

        return results.map(category => ({
            category_id: category.category_id,
            category_name: category.category_name,
            revenue: Number(category.revenue) || 0,
            revenue_percentage: totalRevenue > 0 ? (Number(category.revenue) / totalRevenue) * 100 : 0,
            total_sales: Number(category.total_sales) || 0,
            average_order_value: Number(category.average_order_value) || 0,
            total_quantity: Number(category.total_quantity) || 0,
            days_with_sales: Number(category.days_with_sales) || 0
        }))
    }
} 