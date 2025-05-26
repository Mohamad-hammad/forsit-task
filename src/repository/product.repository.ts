import { supabase } from '../config/supabase.config'
import { Product } from '../entities/Product'

export class ProductRepository {
    async createProduct(product: Omit<Product, 'id' | 'created_at' | 'inventory' | 'categoryRelation'>) {
        const { data, error } = await supabase
            .from('products')
            .insert([product])
            .select()
            .single()

        if (error) throw error
        return data as Product
    }
} 