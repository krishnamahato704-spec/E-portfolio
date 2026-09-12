import { config } from './config.js';

// Base Supabase URL and public anon key
export const supabaseUrl = config.url || 'https://oyqevsygintkjrkfbzpx.supabase.co';
export const supabaseAnonKey = config.key || 'sb_publishable_CZOIotDHbTM9m4E8vHZ9Aw_H3-G9mAd';

let createClientFn = null;
try {
  // Dynamically import in environments that support npm resolution (such as Node.js)
  const pkg = await import('@supabase/supabase-js');
  createClientFn = pkg.createClient;
} catch {
  if (typeof window !== 'undefined' && window.supabase?.createClient) {
    createClientFn = window.supabase.createClient;
  }
}

// Initialized Supabase client instance (or null if module is unresolvable in plain browser context)
export const supabase = typeof createClientFn === 'function' ? createClientFn(supabaseUrl, supabaseAnonKey) : null;

export default supabase;

