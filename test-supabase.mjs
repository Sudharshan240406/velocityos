import { createClient } from '@supabase/supabase-js';

const url = 'https://likhljjflibcdqoizdlm.supabase.co';
const key = 'sb_publishable_QgmtKGpulUa6bTDsur5AFg_uBHCz1kS';

try {
  const supabase = createClient(url, key);
  console.log("Supabase client initialized successfully");
} catch (e) {
  console.error("Failed to initialize:", e);
  process.exit(1);
}
