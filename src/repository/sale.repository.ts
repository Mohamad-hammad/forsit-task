import { supabase } from '../config/supabase.config'
import { Sale } from '../entities/Sale'

export class SaleRepository {
    async createSale(sale: Omit<Sale, 'id' | 'created_at' | 'product'>) {
        const { data, error } = await supabase
            .from('sales')
            .insert([sale])
            .select()
            .single()

        if (error) throw error
        return data as Sale
    }
} 