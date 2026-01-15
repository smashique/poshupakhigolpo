// api/create-payment.js
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { deviceId } = JSON.parse(req.body);
        
        // Vercel Environment Variables থেকে কী-গুলো নেওয়া হচ্ছে
        const API_KEY = process.env.UDDOKTAPAY_API_KEY;
        const API_URL = "https://ashique.paymently.io/api/checkout-v2"; // আপনার প্যানেল অনুযায়ী আপডেট করা

        const payload = {
            full_name: "Customer",
            email: "customer@poshupakhi.com",
            amount: 299, // আপনার নির্ধারিত মূল্য
            metadata: {
                device_id: deviceId // এটি পেমেন্ট ভেরিফিকেশনের জন্য জরুরি
            },
            redirect_url: "https://poshupakhigolpo.vercel.app/", 
            cancel_url: "https://poshupakhigolpo.vercel.app/checkout.html",
            webhook_url: "https://poshupakhigolpo.vercel.app/api/payment-webhook" 
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
            return res.status(400).json({ error: data.message || "Payment initiation failed" });
        }
    } catch (error) {
        console.error("API Error:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}
