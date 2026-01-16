import { createClient } from '@supabase/supabase-js';

// ১. সুপাবেস ইনিশিয়ালাইজেশন (service_role key ব্যবহার করা হয়েছে যাতে RLS বাইপাস করে আপডেট করা যায়)
// এটি একটি গোপন কী, তাই এটি কখনোই পাবলিক ফাইল (যেমন index.html বা app.js) এ ব্যবহার করবেন না।
const _supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL, 
    process.env.SUPABASE_SERVICE_ROLE_KEY // anon key নয়, এখানে service_role key ব্যবহার করা হয়েছে
);

export default async function handler(req, res) {
    // শুধুমাত্র POST রিকোয়েস্ট গ্রহণ করা হবে
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        // গেটওয়ে থেকে আসা ডাটা রিসিভ করা (UddoktaPay/Paymently ফরম্যাট অনুযায়ী)
        const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
        const { status, metadata } = body;

        // চেকআউট পেজ থেকে পাঠানো device_id রিকভার করা
        const deviceId = metadata?.device_id || metadata?.deviceId;

        if (!deviceId) {
            console.error("Webhook Error: No Device ID found in metadata");
            // গেটওয়্যুকে ২০০ রেসপন্স দেওয়াই নিরাপদ যাতে তারা বারবার রিকোয়েস্ট না পাঠায়
            return res.status(200).json({ status: 'ignored', message: 'No device ID found' }); 
        }

        // ২. পেমেন্ট সফল হয়েছে কি না যাচাই করা
        if (status === 'COMPLETED' || status === 'SUCCESS') {
            
            console.log(`Payment Success for Device: ${deviceId}`);

            // ৩. ডাটাবেসে ইউজার স্ট্যাটাস আপডেট করা
            // service_role ব্যবহারের ফলে এটি কোনো পাবলিক পলিসি ছাড়াই ডাটা আপডেট করতে পারবে।
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

        // পেমেন্ট ফেইল করলে বা অন্য কোনো স্ট্যাটাস থাকলে
        console.warn(`Payment Status: ${status} for Device: ${deviceId}`);
        return res.status(200).json({ message: 'Payment incomplete or failed' });

    } catch (err) {
        console.error("Webhook Handler Error:", err.message);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
