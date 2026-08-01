const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function test() {
  const { data, error } = await supabase.auth.signUp({
    email: 'test' + Date.now() + '@example.com',
    password: 'password123',
  });
  console.log("Auth Data:", data);
  console.log("Auth Error:", error);
  if (data.user) {
    const { error: insertError } = await supabase.from('vendors').insert({
      auth_id: data.user.id,
      name: "Test",
      email: "test@example.com",
    });
    console.log("Insert Error:", insertError);
  }
}
test();
