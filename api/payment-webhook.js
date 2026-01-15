import { createClient } from '@supabase/supabase-js';

// ১. সুপাবেস কানেকশন ইনিশিয়ালাইজেশন
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
        // গেটওয়ে থেকে আসা ডাটা রিসিভ করা (UddoktaPay/Paymently ফরম্যাট অনুযায়ী)
        const body = req.body;
        const { status, metadata } = body;

        // চেকআউট পেজ থেকে পাঠানো deviceId রিকভার করা
        const deviceId = metadata?.device_id || metadata?.deviceId;

        if (!deviceId) {
            console.error("Webhook Error: No Device ID found in metadata");
            return res.status(400).json({ error: 'Device ID missing in metadata' });
        }

        // ২. পেমেন্ট সফল হয়েছে কি না যাচাই করা
        if (status === 'COMPLETED' || status === 'SUCCESS') {
            
            console.log(`Payment Success for Device: ${deviceId}`);

            // ৩. ডাটাবেসে ইউজার স্ট্যাটাস আপডেট করা
            const { error } = await _supabase
                .from('users')
                .update({ status: 'paid' })
                .eq('device_uuid', deviceId); // ডাটাবেস কলামের নাম 'device_uuid'

            if (error) {
                console.error("DB Update Error:", error.message);
                throw error;
            }

            return res.status(200).json({ 
                message: 'Success! User upgraded to Paid status.',
                device_id: deviceId
            });
        }

        // পেমেন্ট ফেইল করলে বা ক্যানসেল হলে
        console.warn(`Payment Status: ${status} for Device: ${deviceId}`);
        return res.status(200).json({ message: 'Payment incomplete or failed' });

    } catch (err) {
        console.error("Webhook Handler Error:", err.message);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
