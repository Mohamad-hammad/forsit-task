import { InventoryRepository } from '../repository/inventory.repository'
import { Inventory } from '../entities/Inventory'

export class InventoryService {
    private inventoryRepository: InventoryRepository

    constructor() {
        this.inventoryRepository = new InventoryRepository()
    }

    async createInventory(productId: string, currentStock: number, minimumThreshold: number = 10): Promise<Inventory> {
        const inventory: Omit<Inventory, 'id' | 'updated_at' | 'product'> = {
            product_id: productId,
            current_stock: currentStock,
            minimum_threshold: minimumThreshold
        }

        return await this.inventoryRepository.createInventory(inventory)
    }

    async getInventory(filters: {
        page?: number;
        limit?: number;
        categoryId?: string;
        sortBy?: string;
        sortOrder?: 'ASC' | 'DESC';
    }) {
        return await this.inventoryRepository.getInventory(filters)
    }

    async getInventoryAlerts(filters: {
        page?: number;
        limit?: number;
        categoryId?: string;
    }) {
        return await this.inventoryRepository.getInventoryAlerts(filters)
    }

    async updateInventory(id: string, updates: {
        current_stock?: number;
        minimum_threshold?: number;
    }) {
        return await this.inventoryRepository.updateInventory(id, updates)
    }
} 