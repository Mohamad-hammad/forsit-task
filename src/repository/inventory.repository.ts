import { AppDataSource } from '../data-source'
import { Inventory } from '../entities/Inventory'
import { Product } from '../entities/Product'
import { Category } from '../entities/Category'

// Manages inventory operations including stock tracking and alerts
export class InventoryRepository {
    private inventoryRepository = AppDataSource.getRepository(Inventory)

    // Creates a new inventory record for a product
    async createInventory(inventory: Omit<Inventory, 'id' | 'updated_at' | 'product'>) {
        const newInventory = this.inventoryRepository.create(inventory)
        return await this.inventoryRepository.save(newInventory)
    }

    // Retrieves inventory with filtering, sorting, and pagination
    async getInventory(filters: {
        page?: number;
        limit?: number;
        categoryId?: string;
        sortBy?: string;
        sortOrder?: 'ASC' | 'DESC';
    }) {
        const queryBuilder = this.inventoryRepository
            .createQueryBuilder('inventory')
            .leftJoinAndSelect('inventory.product', 'product')
            .leftJoinAndSelect('product.categoryRelation', 'category')
            .select([
                'inventory.id',
                'inventory.current_stock',
                'inventory.minimum_threshold',
                'inventory.updated_at',
                'product.id',
                'product.name',
                'product.sku',
                'product.price',
                'category.id',
                'category.name'
            ])

        if (filters.categoryId) {
            queryBuilder.andWhere('category.id = :categoryId', { categoryId: filters.categoryId })
        }

        if (filters.sortBy) {
            const validSortFields = ['current_stock', 'updated_at']
            const sortField = validSortFields.includes(filters.sortBy) ? filters.sortBy : 'current_stock'
            const sortOrder = filters.sortOrder?.toLowerCase() === 'asc' ? 'ASC' : 'DESC'
            queryBuilder.orderBy(`inventory.${sortField}`, sortOrder)
        } else {
            queryBuilder.orderBy('inventory.current_stock', 'ASC')
        }

        const total = await queryBuilder.getCount()

        if (filters.page && filters.limit) {
            const skip = (filters.page - 1) * filters.limit
            queryBuilder.skip(skip).take(filters.limit)
        }

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

    // Gets inventory items that are below their minimum threshold
    async getInventoryAlerts(filters: {
        page?: number;
        limit?: number;
        categoryId?: string;
    }) {
        const queryBuilder = this.inventoryRepository
            .createQueryBuilder('inventory')
            .leftJoinAndSelect('inventory.product', 'product')
            .leftJoinAndSelect('product.categoryRelation', 'category')
            .select([
                'inventory.id',
                'inventory.current_stock',
                'inventory.minimum_threshold',
                'inventory.updated_at',
                'product.id',
                'product.name',
                'product.sku',
                'product.price',
                'category.id',
                'category.name'
            ])
            .where('inventory.current_stock <= inventory.minimum_threshold')

        if (filters.categoryId) {
            queryBuilder.andWhere('category.id = :categoryId', { categoryId: filters.categoryId })
        }

        queryBuilder.orderBy('(inventory.minimum_threshold - inventory.current_stock)', 'DESC')

        const total = await queryBuilder.getCount()

        if (filters.page && filters.limit) {
            const skip = (filters.page - 1) * filters.limit
            queryBuilder.skip(skip).take(filters.limit)
        }

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

    // Updates inventory stock levels and thresholds
    async updateInventory(id: string, updates: {
        current_stock?: number;
        minimum_threshold?: number;
    }) {
        const inventory = await this.inventoryRepository.findOne({
            where: { id },
            relations: ['product', 'product.categoryRelation']
        })

        if (!inventory) {
            throw new Error('Inventory not found')
        }

        // Update only the provided fields
        if (updates.current_stock !== undefined) {
            inventory.current_stock = updates.current_stock
        }
        if (updates.minimum_threshold !== undefined) {
            inventory.minimum_threshold = updates.minimum_threshold
        }

        return await this.inventoryRepository.save(inventory)
    }
} 