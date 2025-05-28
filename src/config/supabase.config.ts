// import { createClient, SupabaseClient } from '@supabase/supabase-js'
// import dotenv from 'dotenv'

// dotenv.config()

// if (!process.env.SUPABASE_URL) {
//     throw new Error('Missing SUPABASE_URL environment variable')
// }

// if (!process.env.SUPABASE_ANON_KEY) {
//     throw new Error('Missing SUPABASE_ANON_KEY environment variable')
// }

// let supabase: SupabaseClient;
// try {
//     supabase = createClient(
//         process.env.SUPABASE_URL,
//         process.env.SUPABASE_ANON_KEY,
//         {
//             auth: {
//                 autoRefreshToken: true,
//                 persistSession: true
//             }
//         }
//     )
//     console.log('Supabase client initialized successfully')
// } catch (error) {
//     console.error('Error initializing Supabase client:', error)
//     throw error
// }

// export { supabase }
