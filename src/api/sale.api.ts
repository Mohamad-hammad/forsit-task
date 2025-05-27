import { Router, Request, Response } from 'express'
import { SaleService } from '../service/sale.service'

const router = Router()
const saleService = new SaleService()

router.post('/', async (req: Request, res: Response) => {
    try {
        const { product_id, quantity, unit_price, total_amount, sale_date } = req.body
        if (!product_id || !quantity || !unit_price || !total_amount || !sale_date) {
            return res.status(400).json({
                success: false,
                error: 'All fields are required'
            })
        }
        const sale = await saleService.createSale({
            product_id,
            quantity,
            unit_price,
            total_amount,
            sale_date
        })
        res.status(201).json({ success: true, data: sale })
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message || 'Failed to create sale' })
    }
})

router.get('/', async (req: Request, res: Response) => {
    try {
        const {
            startDate,
            endDate,
            productId,
            categoryId,
            page,
            limit
        } = req.query

        const filters = {
            startDate: startDate as string | undefined,
            endDate: endDate as string | undefined,
            productId: productId as string | undefined,
            categoryId: categoryId as string | undefined,
            page: page ? parseInt(page as string) : undefined,
            limit: limit ? parseInt(limit as string) : undefined
        }

        if (filters.startDate && !isValidDate(filters.startDate)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid Date format. Use format (YYYY-MM-DD)'
            })
        }
        if (filters.endDate && !isValidDate(filters.endDate)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid Date format. Use format (YYYY-MM-DD)'
            })
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

        const result = await saleService.getSales(filters)
        res.json({
            success: true,
            data: result.data,
            metadata: result.metadata
        })
    } catch (error: any) {
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to retrieve sales'
        })
    }
})

router.get('/revenue/daily', async (req: Request, res: Response) => {
    try {
        const {
            startDate,
            endDate,
            productId,
            categoryId
        } = req.query

        const filters = {
            startDate: startDate as string | undefined,
            endDate: endDate as string | undefined,
            productId: productId as string | undefined,
            categoryId: categoryId as string | undefined
        }

        if (filters.startDate && !isValidDate(filters.startDate)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid Date format. Use format (YYYY-MM-DD)'
            })
        }
        if (filters.endDate && !isValidDate(filters.endDate)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid Date format. Use format (YYYY-MM-DD)'
            })
        }

        const dailyRevenue = await saleService.getDailyRevenue(filters)
        res.json({
            success: true,
            data: dailyRevenue
        })
    } catch (error: any) {
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to retrieve daily revenue'
        })
    }
})

router.get('/revenue/weekly', async (req: Request, res: Response) => {
    try {
        const {
            startDate,
            endDate,
            productId,
            categoryId
        } = req.query

        const filters = {
            startDate: startDate as string | undefined,
            endDate: endDate as string | undefined,
            productId: productId as string | undefined,
            categoryId: categoryId as string | undefined
        }

        if (filters.startDate && !isValidDate(filters.startDate)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid Date format. Use format (YYYY-MM-DD)'
            })
        }
        if (filters.endDate && !isValidDate(filters.endDate)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid Date format. Use format (YYYY-MM-DD)'
            })
        }

        const weeklyRevenue = await saleService.getWeeklyRevenue(filters)
        res.json({
            success: true,
            data: weeklyRevenue
        })
    } catch (error: any) {
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to retrieve weekly revenue'
        })
    }
})

router.get('/revenue/monthly', async (req: Request, res: Response) => {
    try {
        const {
            startDate,
            endDate,
            productId,
            categoryId
        } = req.query

        const filters = {
            startDate: startDate as string | undefined,
            endDate: endDate as string | undefined,
            productId: productId as string | undefined,
            categoryId: categoryId as string | undefined
        }

        if (filters.startDate && !isValidDate(filters.startDate)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid Date format. Use format (YYYY-MM-DD)'
            })
        }
        if (filters.endDate && !isValidDate(filters.endDate)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid Date format. Use format (YYYY-MM-DD)'
            })
        }

        const monthlyRevenue = await saleService.getMonthlyRevenue(filters)
        res.json({
            success: true,
            data: monthlyRevenue
        })
    } catch (error: any) {
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to retrieve monthly revenue'
        })
    }
})

router.get('/revenue/annual', async (req: Request, res: Response) => {
    try {
        const {
            startDate,
            endDate,
            productId,
            categoryId
        } = req.query

        const filters = {
            startDate: startDate as string | undefined,
            endDate: endDate as string | undefined,
            productId: productId as string | undefined,
            categoryId: categoryId as string | undefined
        }

        if (filters.startDate && !isValidDate(filters.startDate)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid Date format. Use format (YYYY-MM-DD)'
            })
        }
        if (filters.endDate && !isValidDate(filters.endDate)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid Date format. Use format (YYYY-MM-DD)'
            })
        }

        const annualRevenue = await saleService.getAnnualRevenue(filters)
        res.json({
            success: true,
            data: annualRevenue
        })
    } catch (error: any) {
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to retrieve annual revenue'
        })
    }
})

function isValidDate(dateString: string): boolean {
    const regex = /^\d{4}-\d{2}-\d{2}$/
    if (!regex.test(dateString)) return false
    const date = new Date(dateString)
    return date instanceof Date && !isNaN(date.getTime())
}

export default router 