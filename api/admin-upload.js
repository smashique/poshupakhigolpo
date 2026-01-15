// api/admin-upload.js
import { createClient } from '@supabase/supabase-js';

const _supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

    const { password, title, webapp_html } = JSON.parse(req.body);

    // ভার্সেল এনভায়রনমেন্ট ভেরিয়েবলের সাথে পাসওয়ার্ড চেক
    if (password !== process.env.ADMIN_PASSWORD) {
        return res.status(401).json({ error: "ভুল পাসওয়ার্ড!" });
    }

    // ডাটাবেসে ইনসার্ট করা
    const { error } = await _supabase.from('stories').insert([
        { 
            title: title, 
            webapp_html: webapp_html, 
            thumbnail_url: "assets/logo.svg", // ডিফল্ট লোগো ব্যবহার হচ্ছে যেহেতু আপনি SVG দেবেন না
            is_premium: false // ডিফল্টভাবে ফ্রি হিসেবে আপলোড হবে
        }
    ]);

    if (error) return res.status(500).json({ error: error.message });
    
    return res.status(200).json({ message: "গল্পটি সফলভাবে আপলোড হয়েছে ইনশাআল্লাহ।" });
}
