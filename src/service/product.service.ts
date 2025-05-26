import { ProductRepository } from '../repository/product.repository'
import { Product } from '../entities/Product'

export class ProductService {
    private productRepository: ProductRepository

    constructor() {
        this.productRepository = new ProductRepository()
    }

    private generateRandomSku(): string {
        return `SKU-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
    }

    private generateRandomPrice(): number {
        return Number((Math.random() * 1000).toFixed(2))
    }

    private getRandomCategory(): string {
        const categories = ['Electronics', 'Clothing', 'Books', 'Home', 'Sports', 'Toys']
        return categories[Math.floor(Math.random() * categories.length)]
    }

    private generateRandomProduct(): Omit<Product, 'id' | 'created_at' | 'inventory' | 'categoryRelation'> {
        return {
            name: `Product ${Math.floor(Math.random() * 1000)}`,
            sku: this.generateRandomSku(),
            price: this.generateRandomPrice(),
            category: this.getRandomCategory()
        }
    }


    async createProduct(product: Omit<Product, 'id' | 'created_at' | 'inventory' | 'categoryRelation'>): Promise<Product> {
        return await this.productRepository.createProduct(product)
    }
} 