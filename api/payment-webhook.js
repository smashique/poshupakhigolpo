// api/payment-webhook.js
import { createClient } from '@supabase/supabase-js';

const _supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

    const { status, metadata } = req.body;
    const deviceId = metadata.device_id;

    if (status === 'COMPLETED' || status === 'SUCCESS') {
        // ডাটাবেসে ইউজারকে 'paid' মার্ক করা
        const { error } = await _supabase
            .from('users')
            .update({ status: 'paid' })
            .eq('device_uuid', deviceId);

        if (error) return res.status(500).send('Database Update Failed');
        return res.status(200).send('User Upgraded to Paid Status');
    }

    res.status(400).send('Payment Incomplete');
}
