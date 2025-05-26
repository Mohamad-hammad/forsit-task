import { Router, Request, Response } from 'express'
import { SeedingService } from '../service/seeding.service'

const router = Router()
const seedingService = new SeedingService()

router.post('/', async (req: Request, res: Response) => {
    try {
        const result = await seedingService.seedDatabase()
        
        res.status(201).json({
            success: true,
            data: {
                categories: result.categories.length,
                products: result.products.length,
                inventory: result.inventory.length,
                sales: result.sales.length,
                details: result
            }
        })
    } catch (error: any) {
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to seed database'
        })
    }
})

export default router 