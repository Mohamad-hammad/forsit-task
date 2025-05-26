import { supabase } from '../config/supabase.config'
import { Inventory } from '../entities/Inventory'

export class InventoryRepository {
    async createInventory(inventory: Omit<Inventory, 'id' | 'updated_at' | 'product'>) {
        const { data, error } = await supabase
            .from('inventory')
            .insert([inventory])
            .select()
            .single()

        if (error) throw error
        return data as Inventory
    }
} 