// api/payment-webhook.js
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const { full_name, email, amount, transaction_id, status } = req.body;

  if (status === 'Completed') {
    // এখানে আপনার ডেটাবেসে ইউজারের device_uuid এর বিপরীতে 'paid' স্ট্যাটাস সেভ করার লজিক হবে।
    console.log(`Payment successful for Transaction: ${transaction_id}`);
    return res.status(200).json({ success: true });
  }

  res.status(400).send('Payment Failed');
}
