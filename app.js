// --- Supabase কনফিগারেশন ---
const SUPABASE_URL = 'https://xptwwlrcygimfislsutz.supabase.co'; 
const SUPABASE_ANON_KEY = 'sb_publishable_N0YqY-tMEW_KWxFdS7zgVA_3CgR8Go-';

const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let userStatus = 'free'; 

async function initApp() {
    let uuid = localStorage.getItem('device_uuid') || self.crypto.randomUUID();
    localStorage.setItem('device_uuid', uuid);
    if(document.getElementById('footerUid')) document.getElementById('footerUid').innerText = uuid;

    try {
        // ১. গল্পের সংখ্যা আপডেট করা
        const { count, error: countError } = await _supabase.from('stories').select('*', { count: 'exact', head: true });
        if (countError) throw countError;
        if(document.getElementById('totalCount')) document.getElementById('totalCount').innerText = count || 0;

        // ২. ইউজার স্ট্যাটাস চেক
        const { data: user } = await _supabase.from('users').select('status').eq('device_uuid', uuid).maybeSingle();
        if (!user) {
            await _supabase.from('users').insert([{ device_uuid: uuid, status: 'free' }]);
        } else if (user.status === 'paid') {
            userStatus = 'paid';
            document.querySelectorAll('.premium-banner, .lock-overlay').forEach(el => el.style.display = 'none');
        }
        loadStories();
    } catch (err) {
        console.error("সুপাবেস কানেকশন এরর:", err.message);
    }
}

async function loadStories() {
    const { data: stories, error } = await _supabase.from('stories').select('*');
    if (error) {
        console.error("গল্প লোড এরর:", error.message);
        return;
    }

    if (stories && stories.length > 0) {
        playStory(stories[0]); // প্রথম গল্পটি দেখাবে
        renderSidebar(stories);
    }
}

function playStory(story) {
    const frame = document.getElementById('storyFrame');
    const overlay = document.getElementById('lockOverlay');
    
    if (story.is_premium && userStatus === 'free') {
        frame.src = "about:blank";
        overlay.classList.remove('hidden');
    } else {
        overlay.classList.add('hidden');
        // আপনার নতুন কলাম 'content' ব্যবহার করা হচ্ছে
        const storyContent = story.content || "গল্পের কোনো তথ্য নেই।";
        const storyHtml = `<html><head><link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri&display=swap" rel="stylesheet"><style>body{font-family:'Hind Siliguri',sans-serif;padding:6%;line-height:1.8;background:#FDFBF7;color:#263238;font-size:1.4rem;}</style></head><body>${storyContent.replace(/\n/g, '<br>')}</body></html>`;
        const blob = new Blob([storyHtml], { type: 'text/html' });
        frame.src = URL.createObjectURL(blob);
    }
}

function renderSidebar(stories) {
    const sidebarList = document.getElementById('storyList');
    if (!sidebarList) return;
    sidebarList.innerHTML = '';
    stories.forEach(s => {
        const banner = document.createElement('div');
        banner.className = 'story-banner';
        banner.style.backgroundImage = `url('${s.thumbnail_url || 'assets/logo.svg'}')`;
        // আপনার নতুন কলাম 'title' ব্যবহার করা হচ্ছে
        banner.innerHTML = `<div style="background:rgba(0,0,0,0.5);color:white;padding:5px;">${s.title}</div>`;
        banner.onclick = () => { playStory(s); window.scrollTo({ top: 0, behavior: 'smooth' }); };
        sidebarList.appendChild(banner);
    });
}

document.addEventListener('DOMContentLoaded', initApp);
