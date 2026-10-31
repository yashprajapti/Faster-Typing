import { createClient } from '@supabase/supabase-js';

// The project URL and the publishable key are public by design (they are safe in the browser).
// Your data is protected by the Row Level Security rules in supabase/schema.sql, not by hiding these values.
// A .env file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY still overrides them if you ever add a second project.
const FALLBACK_URL = 'https://pwdpslqptaskeflrxvbt.supabase.co';
const FALLBACK_KEY = 'sb_publishable_ddxx2CS_k22YnbJDbe4T4w_fp4YFqc_';

const url = import.meta.env.VITE_SUPABASE_URL || FALLBACK_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || FALLBACK_KEY;

export const supabaseReady = Boolean(url && anonKey);
export const supabase = createClient(url, anonKey);

// Users log in with a username. Supabase Auth needs an email, so each username maps to a fixed address.
export const emailFor = (username) => `${username}@faster.app`;
