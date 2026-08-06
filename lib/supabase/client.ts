import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://udluqqebhubfswvgodvh.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_o5KVdEc9NOq_TfbZleZgXA_3BE9LKlU";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
