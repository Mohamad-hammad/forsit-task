import { SaleRepository } from '../repository/sale.repository'
import { Sale } from '../entities/Sale'

export class SaleService {
    private saleRepository: SaleRepository

    constructor() {
        this.saleRepository = new SaleRepository()
    }

    async createSale(sale: Omit<Sale, 'id' | 'created_at' | 'product'>): Promise<Sale> {
        return await this.saleRepository.createSale(sale)
    }

    async getSales(filters: {
        startDate?: string;
        endDate?: string;
        productId?: string;
        categoryId?: string;
        page?: number;
        limit?: number;
    }) {
        return await this.saleRepository.getSales(filters)
    }

    async getDailyRevenue(filters: {
        startDate?: string;
        endDate?: string;
        productId?: string;
        categoryId?: string;
    }) {
        return await this.saleRepository.getDailyRevenue(filters)
    }

    async getWeeklyRevenue(filters: {
        startDate?: string;
        endDate?: string;
        productId?: string;
        categoryId?: string;
    }) {
        return await this.saleRepository.getWeeklyRevenue(filters)
    }

    async getMonthlyRevenue(filters: {
        startDate?: string;
        endDate?: string;
        productId?: string;
        categoryId?: string;
    }) {
        return await this.saleRepository.getMonthlyRevenue(filters)
    }

    async getAnnualRevenue(filters: {
        startDate?: string;
        endDate?: string;
        productId?: string;
        categoryId?: string;
    }) {
        return await this.saleRepository.getAnnualRevenue(filters)
    }
} 