// api/seo.js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  const { id } = req.query;

  // গল্পের আইডি দিয়ে ডেটাবেস থেকে তথ্য আনা
  const { data: story, error } = await supabase
    .from('stories')
    .select('title_bn, content_bn')
    .eq('id', id)
    .single();

  if (error || !story) {
    return res.status(404).send('গল্পটি পাওয়া যায়নি');
  }

  // ডাইনামিক মেটা ট্যাগসহ HTML পাঠানো
  res.setHeader('Content-Type', 'text/html');
  res.send(`
    <!DOCTYPE html>
    <html lang="bn">
    <head>
      <meta charset="UTF-8">
      <title>${story.title_bn} - পশুপাখি গল্প</title>
      <meta name="description" content="${story.content_bn.substring(0, 150)}...">
      <meta property="og:title" content="${story.title_bn}">
      <meta property="og:image" content="https://poshupakhigolpo.online/assets/logo.svg">
      <script>
        // ইউজারকে মেইন স্টোরি প্লেয়ারে পাঠিয়ে দেওয়া
        window.location.href = "/?id=${id}";
      </script>
    </head>
    <body>
      <h1>${story.title_bn}</h1>
      <p>${story.content_bn}</p>
    </body>
    </html>
  `);
}
