import { supabase } from './server/db/supabase.js';

async function testInsert() {
  const { data, error } = await supabase.from('users').insert({
    id: '123e4567-e89b-12d3-a456-426614174000',
    username: 'test_insert',
    password_hash: 'hash',
    first_name: 'test',
    last_name: 'test',
    medical_council_number: '123456789'
  });
  console.log('Insert Result:', { data, error });
}
testInsert();
