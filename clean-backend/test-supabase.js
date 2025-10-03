const { createClient } = require('@supabase/supabase-js');

// Test Supabase connection with hardcoded values
const supabaseUrl = 'https://imhkrycglxvjlpseieqv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImltaGryeWNnbHh2amxwc2VpZXF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyMDI1NjcsImV4cCI6MjA3Mzc3ODU2N30.Lc2j8sEFCElNARu3JZet53Z6Yn50X1e3snM5yHlg36E.';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImltaGryeWNnbHh2amxwc2VpZXF2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODIwMjU2NywiZXhwIjoyMDczNzc4NTY3fQ.Y9V4pclXXUN3RZymOPqvGleXSUqE-NCUoDcMZQcqu6o.';

async function testSupabase() {
  console.log('🔗 Testing Supabase connection...');
  
  try {
    // Test with anon key
    const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey);
    console.log('Testing anon key...');
    const { data: anonData, error: anonError } = await supabaseAnon
      .from('customers')
      .select('*')
      .limit(1);
    
    if (anonError) {
      console.log('❌ Anon key error:', anonError.message);
    } else {
      console.log('✅ Anon key works:', anonData);
    }
    
    // Test with service role key
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    console.log('Testing service role key...');
    const { data: adminData, error: adminError } = await supabaseAdmin
      .from('customers')
      .select('*')
      .limit(1);
    
    if (adminError) {
      console.log('❌ Service role key error:', adminError.message);
    } else {
      console.log('✅ Service role key works:', adminData);
    }
    
  } catch (error) {
    console.error('❌ Connection test failed:', error);
  }
}

testSupabase();
