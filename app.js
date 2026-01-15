// --- Supabase কনফিগারেশন ---
// সরাসরি আপনার ছবির আসল তথ্য এখানে বসানো হলো
const SUPABASE_URL = 'https://xptwwlrcygimfislsutz.supabase.co'; 
const SUPABASE_ANON_KEY = 'sb_publishable_N0YqY-tMEW_KWxFdS7zgVA_3CgR8Go-';

const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function initApp() {
    let uuid = localStorage.getItem('device_uuid') || self.crypto.randomUUID();
    localStorage.setItem('device_uuid', uuid);
    if(document.getElementById('footerUid')) document.getElementById('footerUid').innerText = uuid;

    try {
        // ১. গল্পের সংখ্যা চেক করা
        const { count, error: countError } = await _supabase.from('stories').select('*', { count: 'exact', head: true });
        if (countError) throw countError;
        if(document.getElementById('totalCount')) document.getElementById('totalCount').innerText = count || 0;

        loadStories();
    } catch (err) {
        console.error("গল্প লোড করতে সমস্যা হয়েছে:", err.message); //
    }
}

async function loadStories() {
    // আপনার নতুন টেবিল স্ট্রাকচার অনুযায়ী ডাটা আনা
    const { data: stories, error } = await _supabase.from('stories').select('*');
    if (error) return;

    if (stories && stories.length > 0) {
        playStory(stories[0]);
        renderSidebar(stories);
    }
}

function playStory(story) {
    const frame = document.getElementById('storyFrame');
    // 'content' কলাম থেকে ডাটা নেয়া হচ্ছে
    const content = story.content || "কোনো গল্প পাওয়া যায়নি।";
    const storyHtml = `<html><body style="font-family:sans-serif; padding:20px;">${content.replace(/\n/g, '<br>')}</body></html>`;
    const blob = new Blob([storyHtml], { type: 'text/html' });
    frame.src = URL.createObjectURL(blob);
}

document.addEventListener('DOMContentLoaded', initApp);
