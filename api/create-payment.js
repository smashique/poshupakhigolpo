export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { deviceId } = JSON.parse(req.body);
        const API_KEY = process.env.UDDOKTAPAY_API_KEY;
        const API_URL = "https://ashique.paymently.io/api/checkout-v2"; 
        const SITE_URL = "https://poshupakhigolpo.online";

        const payload = {
            full_name: "Customer",
            email: "customer@poshupakhi.com",
            amount: 299, 
            metadata: {
                device_id: deviceId 
            },
            // এখানে সাকসেস প্যারামিটার যোগ করা হয়েছে
            redirect_url: `${SITE_URL}/checkout.html?status=success`, 
            cancel_url: `${SITE_URL}/checkout.html`,
            webhook_url: `${SITE_URL}/api/payment-webhook` 
        };

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'RT-UDDOKTAPAY-API-KEY': API_KEY
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (data.status && data.payment_url) {
            return res.status(200).json({ payment_url: data.payment_url });
        } else {
            return res.status(400).json({ error: data.message || "পেমেন্ট শুরু করা যায়নি" });
        }
    } catch (error) {
        console.error("Payment API Error:", error);
        return res.status(500).json({ error: "সার্ভার এরর" });
    }
}
