import { CategoryRepository } from '../repository/category.repository'
import { Category } from '../entities/Category'

export class CategoryService {
    private categoryRepository: CategoryRepository

    constructor() {
        this.categoryRepository = new CategoryRepository()
    }

    async createCategory(category: Omit<Category, 'id' | 'created_at' | 'updated_at' | 'products'>): Promise<Category> {
        return await this.categoryRepository.createCategory(category)
    }
} 