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

export default router 