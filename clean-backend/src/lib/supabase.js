const { createClient } = require('@supabase/supabase-js');

// Supabase configuration - new project
const supabaseUrl = 'https://ytvqlqyoptehvumaibds.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl0dnFscXlvcHRlaHZ1bWFpYmRzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyMzEwNzQsImV4cCI6MjA3NDgwNzA3NH0.pe-XYNoXcw11reYSO_m2Wjq5SxX1xbXKrzwgPhVUYoA';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl0dnFscXlvcHRlaHZ1bWFpYmRzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTIzMTA3NCwiZXhwIjoyMDc0ODA3MDc0fQ.rRVAfPZizCVq07BnkvfEHq189urubbJ8iDl243nFkuA';

let supabase = null;
let supabaseAdmin = null;

console.log('🔗 Using Supabase for real-time features');
// Create Supabase client for public operations
supabase = createClient(supabaseUrl, supabaseKey);

// Create Supabase client for admin operations (with service role key)
supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

module.exports = {
  supabase,
  supabaseAdmin
};