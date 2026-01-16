export default async function handler(req, res) {
    // শুধুমাত্র POST রিকোয়েস্ট গ্রহণ করা হবে
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { deviceId } = JSON.parse(req.body);
        
        // এনভায়রনমেন্ট ভেরিয়েবল থেকে কী এবং ইউআরএল নেওয়া
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
            // পেমেন্ট সফল হলে এই ইউআরএল-এ ফিরে আসবে
            redirect_url: `${SITE_URL}/checkout.html?status=success`, 
            cancel_url: `${SITE_URL}/checkout.html`,
            webhook_url: `${SITE_URL}/api/payment-webhook` 
        };

        // পেমেন্ট গেটওয়েতে রিকোয়েস্ট পাঠানো
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

        // রেসপন্স হ্যান্ডেলিং
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
