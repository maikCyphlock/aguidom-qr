import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

async function testSync() {
  try {
    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Sign in a test user (replace with actual test user credentials)
    const { data: { user }, error: signInError } = await supabase.auth.signInWithPassword({
      email: 'test@example.com',
      password: 'testpassword'
    });

    if (signInError) {
      throw new Error(`Sign in failed: ${signInError.message}`);
    }

    if (!user) {
      throw new Error('No user returned after sign in');
    }

    console.log('Signed in user:', user.email);

    // Call the sync endpoint
    const response = await fetch('http://localhost:3000/api/users/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
      },
      body: JSON.stringify({
        userId: user.id,
        email: user.email,
        name: user.user_metadata?.full_name || 'Test User',
        avatarUrl: user.user_metadata?.avatar_url || ''
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Sync failed: ${error}`);
    }

    const result = await response.json();
    console.log('Sync successful:', result);
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  } finally {
    // Sign out the test user
    await supabase.auth.signOut();
    process.exit(0);
  }
}

testSync();
