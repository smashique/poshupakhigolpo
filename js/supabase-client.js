// js/supabase-client.js
const supabaseUrl = window.location.hostname === 'localhost' 
    ? 'YOUR_LOCAL_OR_ANON_URL' 
    : 'https://your-project.supabase.co';
const supabaseKey = 'YOUR_ANON_KEY';

export const supabase = supabase.createClient(supabaseUrl, supabaseKey);
