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
} 