import { CategoryService } from './category.service'
import { ProductService } from './product.service'
import { InventoryService } from './inventory.service'
import { SaleService } from './sale.service'
import { Category } from '../entities/Category'
import { Product } from '../entities/Product'
import { Inventory } from '../entities/Inventory'
import { Sale } from '../entities/Sale'

export class SeedingService {
    private categoryService: CategoryService
    private productService: ProductService
    private inventoryService: InventoryService
    private saleService: SaleService

    constructor() {
        this.categoryService = new CategoryService()
        this.productService = new ProductService()
        this.inventoryService = new InventoryService()
        this.saleService = new SaleService()
    }

    private generateRandomNumber(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1)) + min
    }

    private generateRandomDate(start: Date, end: Date): Date {
        return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
    }

    private async createCategories(): Promise<Category[]> {
        const categories = [
            { name: 'Electronics', description: 'Electronic devices and accessories' },
            { name: 'Clothing', description: 'Apparel and fashion items' },
            { name: 'Books', description: 'Books and publications' },
            { name: 'Home', description: 'Home and kitchen items' },
            { name: 'Sports', description: 'Sports and fitness equipment' }
        ]

        const createdCategories: Category[] = []
        for (const category of categories) {
            const created = await this.categoryService.createCategory(category)
            createdCategories.push(created)
        }
        return createdCategories
    }

    private async createProducts(categories: Category[]): Promise<Product[]> {
        const products: Product[] = []
        const productsPerCategory = 20 

        for (const category of categories) {
            for (let i = 0; i < productsPerCategory; i++) {
                const product = {
                    name: `${category.name} Item ${i + 1}`,
                    sku: `SKU-${category.name.substring(0, 3).toUpperCase()}-${i + 1}`,
                    price: this.generateRandomNumber(10, 1000),
                    category: category.id
                }
                const created = await this.productService.createProduct(product)
                products.push(created)
            }
        }
        return products
    }

    private async createInventory(products: Product[]): Promise<Inventory[]> {
        const inventory: Inventory[] = []
        for (const product of products) {
            const inventoryItem = await this.inventoryService.createInventory(
                product.id,
                this.generateRandomNumber(10, 100),
                this.generateRandomNumber(5, 20)
            )
            inventory.push(inventoryItem)
        }
        return inventory
    }

    private async createSales(products: Product[]): Promise<Sale[]> {
        const sales: Sale[] = []
        const numberOfSales = this.generateRandomNumber(30, 50) 

        for (let i = 0; i < numberOfSales; i++) {
            const randomProduct = products[Math.floor(Math.random() * products.length)]
            const quantity = this.generateRandomNumber(1, 5)
            const unitPrice = randomProduct.price
            const totalAmount = quantity * unitPrice
            const saleDate = this.generateRandomDate(
                new Date(2024, 0, 1), 
                new Date() 
            )

            const sale = await this.saleService.createSale({
                product_id: randomProduct.id,
                quantity,
                unit_price: unitPrice,
                total_amount: totalAmount,
                sale_date: saleDate
            })
            sales.push(sale)
        }
        return sales
    }

    async seedDatabase() {
        try {
            const categories = await this.createCategories()
            
            const products = await this.createProducts(categories)
            
            const inventory = await this.createInventory(products)
            
            const sales = await this.createSales(products)

            return {
                categories,
                products,
                inventory,
                sales
            }
        } catch (error: any) {
            throw new Error(`Seeding failed: ${error.message}`)
        }
    }
} 