import { Router, Request, Response } from 'express'
import { CategoryService } from '../service/category.service'
import { Category } from '../entities/Category'

const router = Router()
const categoryService = new CategoryService()

router.post('/', async (req: Request, res: Response) => {
    try {
        const { name, description } = req.body
        if (!name) {
            return res.status(400).json({
                success: false,
                error: 'Name is required'
            })
        }
        const category = await categoryService.createCategory({
            name,
            description
        } as Omit<Category, 'id' | 'created_at' | 'updated_at' | 'products'>)
        res.status(201).json({ success: true, data: category })
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message || 'Failed to create category' })
    }
})

export default router 