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

export default router 