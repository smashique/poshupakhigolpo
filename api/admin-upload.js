import { createClient } from '@supabase/supabase-js';

// ১. সুপাবেস কানেকশন (ভার্সেল এনভায়রনমেন্ট ভেরিয়েবল থেকে আসবে)
const _supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL, 
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
    // শুধুমাত্র POST রিকোয়েস্ট গ্রহণ করা হবে
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        // রিকোয়েস্ট বডি থেকে ডাটা নেওয়া
        const { password, title, story_content, is_premium } = JSON.parse(req.body);

        // ২. সিকিউরিটি চেক: ভার্সেল এনভায়রনমেন্ট ভেরিয়েবলের সাথে পাসওয়ার্ড চেক
        if (password !== process.env.ADMIN_PASSWORD) {
            return res.status(401).json({ error: "ভুল পাসওয়ার্ড!" });
        }

        // ৩. ডাটাবেসে নতুন গল্প ইনসার্ট করা
        const { error } = await _supabase.from('stories').insert([
            { 
                title: title, 
                story_content: story_content, // এখন সরাসরি টেক্সট জমা হবে
                thumbnail_url: "assets/logo.svg", // ডিফল্ট লোগো ব্যবহার
                is_premium: is_premium // ফ্রন্টএন্ড থেকে আসা স্ট্যাটাস (True/False)
            }
        ]);

        if (error) throw error;

        return res.status(200).json({ 
            message: "গল্পটি সফলভাবে আপলোড হয়েছে ইনশাআল্লাহ।" 
        });

    } catch (err) {
        console.error("Upload Error:", err.message);
        return res.status(500).json({ 
            error: "সার্ভার এরর: " + err.message 
        });
    }
}
