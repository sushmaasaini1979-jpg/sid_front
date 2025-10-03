const { createClient } = require('@supabase/supabase-js');

// Supabase configuration (optional - for SQLite mode)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabase = null;
let supabaseAdmin = null;

// Only create Supabase clients if environment variables are provided
if (supabaseUrl && supabaseKey) {
  console.log('🔗 Using Supabase for real-time features');
  // Create Supabase client for public operations
  supabase = createClient(supabaseUrl, supabaseKey);

  // Create Supabase client for admin operations (with service role key)
  supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
} else {
  console.log('💾 Using SQLite database (Supabase real-time features disabled)');
}

module.exports = {
  supabase,
  supabaseAdmin
};
