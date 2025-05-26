import { supabase } from '../config/supabase.config'
import { Category } from '../entities/Category'

export class CategoryRepository {
    async createCategory(category: Omit<Category, 'id' | 'created_at' | 'updated_at' | 'products'>) {
        const { data, error } = await supabase
            .from('categories')
            .insert([category])
            .select()
            .single()

        if (error) throw error
        return data as Category
    }
} 