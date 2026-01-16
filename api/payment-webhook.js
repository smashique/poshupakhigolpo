import { createClient } from '@supabase/supabase-js';

// ১. সুপাবেস ইনিশিয়ালাইজেশন (সরাসরি এনভায়রনমেন্ট ভেরিয়েবল থেকে)
const _supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL, 
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
    // শুধুমাত্র POST রিকোয়েস্ট গ্রহণ করা হবে
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        // গেটওয়ে থেকে আসা ডাটা রিসিভ করা (Vercel সাধারণত অটো-পার্স করে)
        const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
        const { status, metadata } = body;

        // চেকআউট পেজ থেকে পাঠানো device_id রিকভার করা
        const deviceId = metadata?.device_id || metadata?.deviceId;

        if (!deviceId) {
            console.error("Webhook Error: No Device ID found in metadata");
            return res.status(200).json({ status: 'ignored', message: 'No device ID' }); 
            // নোট: এখানে ৪০০ না দিয়ে ২০০ দেওয়া ভালো যাতে গেটওয়ে বারবার রিকোয়েস্ট না পাঠায়
        }

        // ২. পেমেন্ট সফল হয়েছে কি না যাচাই করা
        if (status === 'COMPLETED' || status === 'SUCCESS') {
            
            console.log(`Payment Success for Device: ${deviceId}`);

            // ৩. ডাটাবেসে ইউজার স্ট্যাটাস আপডেট করা
            const { error } = await _supabase
                .from('users')
                .update({ status: 'paid' })
                .eq('device_uuid', deviceId); 

            if (error) {
                console.error("DB Update Error:", error.message);
                return res.status(500).json({ error: 'Database update failed' });
            }

            return res.status(200).json({ 
                message: 'AlHamdulillah! User upgraded to Paid status.',
                device_id: deviceId
            });
        }

        // পেমেন্ট ফেইল করলে
        return res.status(200).json({ message: 'Payment not successful' });

    } catch (err) {
        console.error("Webhook Handler Error:", err.message);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
