import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://zeirutrmxgmkodxhjaor.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InplaXJ1dHJteGdta29keGhqYW9yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0MzI2MjEsImV4cCI6MjA5MTAwODYyMX0.yS7iqALbKaFtNNVa3kzhcgoO_M0koimjefHEd_mhBsw'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
