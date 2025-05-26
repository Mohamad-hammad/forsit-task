import { Router, Request, Response } from 'express'
import { ProductService } from '../service/product.service'

const router = Router()
const productService = new ProductService()

router.post('/', async (req: Request, res: Response) => {
    try {
        const { name, sku, price, category } = req.body
        if (!name || !sku || !price) {
            return res.status(400).json({
                success: false,
                error: 'Name, SKU, and price are required'
            })
        }
        const product = await productService.createProduct({
            name,
            sku,
            price,
            category
        })
        res.status(201).json({ success: true, data: product })
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message || 'Failed to create product' })
    }
})

export default router 