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
} 