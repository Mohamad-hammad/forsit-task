import { Router, Request, Response } from 'express'
import { InventoryService } from '../service/inventory.service'

const router = Router()
const inventoryService = new InventoryService()

router.post('/', async (req: Request, res: Response) => {
    try {
        const { product_id, current_stock, minimum_threshold } = req.body

        if (!product_id || current_stock === undefined) {
            return res.status(400).json({
                success: false,
                error: 'product_id and current_stock are required'
            })
        }

        const inventory = await inventoryService.createInventory(
            product_id,
            current_stock,
            minimum_threshold
        )

        res.status(201).json({
            success: true,
            data: inventory
        })
    } catch (error: any) {
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to create inventory'
        })
    }
})

router.get('/', async (req: Request, res: Response) => {
    try {
        const {
            page,
            limit,
            categoryId,
            sortBy,
            sortOrder
        } = req.query

        const filters = {
            page: page ? parseInt(page as string) : undefined,
            limit: limit ? parseInt(limit as string) : undefined,
            categoryId: categoryId as string | undefined,
            sortBy: sortBy as string | undefined,
            sortOrder: (sortOrder as 'ASC' | 'DESC') || 'ASC'
        }

        if (filters.page && filters.page < 1) {
            return res.status(400).json({
                success: false,
                error: 'Page number must be greater than 0'
            })
        }
        if (filters.limit && filters.limit < 1) {
            return res.status(400).json({
                success: false,
                error: 'Limit must be greater than 0'
            })
        }

        if (filters.sortOrder && !['ASC', 'DESC'].includes(filters.sortOrder)) {
            return res.status(400).json({
                success: false,
                error: 'Sort order must be either ASC or DESC'
            })
        }

        const result = await inventoryService.getInventory(filters)
        res.json({
            success: true,
            data: result.data,
            metadata: result.metadata
        })
    } catch (error: any) {
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to retrieve inventory'
        })
    }
})

router.get('/alerts', async (req: Request, res: Response) => {
    try {
        const {
            page,
            limit,
            categoryId
        } = req.query

        const filters = {
            page: page ? parseInt(page as string) : undefined,
            limit: limit ? parseInt(limit as string) : undefined,
            categoryId: categoryId as string | undefined
        }

        if (filters.page && filters.page < 1) {
            return res.status(400).json({
                success: false,
                error: 'Page number must be greater than 0'
            })
        }
        if (filters.limit && filters.limit < 1) {
            return res.status(400).json({
                success: false,
                error: 'Limit must be greater than 0'
            })
        }

        const result = await inventoryService.getInventoryAlerts(filters)
        res.json({
            success: true,
            data: result.data,
            metadata: result.metadata
        })
    } catch (error: any) {
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to retrieve inventory alerts'
        })
    }
})

router.patch('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const { current_stock, minimum_threshold } = req.body

        if (current_stock === undefined && minimum_threshold === undefined) {
            return res.status(400).json({
                success: false,
                error: 'At least one field (current_stock or minimum_threshold) must be provided'
            })
        }

        if (current_stock !== undefined && current_stock < 0) {
            return res.status(400).json({
                success: false,
                error: 'Current stock cannot be negative'
            })
        }

        if (minimum_threshold !== undefined && minimum_threshold < 0) {
            return res.status(400).json({
                success: false,
                error: 'Minimum threshold cannot be negative'
            })
        }

        const updatedInventory = await inventoryService.updateInventory(id, {
            current_stock,
            minimum_threshold
        })

        res.json({
            success: true,
            data: updatedInventory
        })
    } catch (error: any) {
        if (error.message === 'Inventory not found') {
            return res.status(404).json({
                success: false,
                error: 'Inventory not found'
            })
        }
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to update inventory'
        })
    }
})

export default router 