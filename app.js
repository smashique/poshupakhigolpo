/* --- PoshuPakhi Golpo - Clean Logic v18.0 --- */
const SUPABASE_URL = 'https://xptwwlrcygimfislsutz.supabase.co'.trim(); 
const SUPABASE_ANON_KEY = 'sb_publishable_N0YqY-tMEW_KWxFdS7zgVA_3CgR8Go-'.trim();
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let userStatus = 'free'; 
let dailyStoryId = null;
let deferredPrompt; 

// ১. গ্লোবাল ফাংশন ডিফাইন (Error Fix)
window.initPayment = () => {
    window.location.href = "checkout.html";
};

window.shareApp = async () => {
    if (navigator.share) {
        try {
            await navigator.share({
                title: 'পشুপাখি গল্প',
                text: 'আমার সোনামণি এখান থেকে নৈতিক গল্প শুনছে। আপনিও আপনার সোনামণিকে উপহার দিন!',
                url: window.location.origin
            });
        } catch (err) { console.log('Share failed'); }
    } else {
        alert('লিঙ্কটি কপি করে বন্ধুদের পাঠান: ' + window.location.origin);
    }
};

async function initApp() {
    let uuid = localStorage.getItem('device_uuid') || self.crypto.randomUUID();
    localStorage.setItem('device_uuid', uuid);
    if(document.getElementById('footerUid')) document.getElementById('footerUid').innerText = uuid;

    try {
        const { count } = await _supabase.from('stories').select('*', { count: 'exact', head: true });
        document.querySelectorAll('#totalCount').forEach(el => el.innerText = count || 0);

        const { data: user } = await _supabase.from('users').select('status').eq('device_uuid', uuid).maybeSingle();
        if (user?.status === 'paid') {
            userStatus = 'paid';
            document.querySelectorAll('.premium-banner, .lock-overlay').forEach(el => el.style.display = 'none');
        }
        loadStories();
    } catch (err) { console.error(err); }
}

async function loadStories() {
    const { data: stories } = await _supabase.from('stories').select('id, title, created_at').order('created_at', { ascending: true });
    if (stories) {
        const todayIndex = Math.floor(Date.now() / 86400000) % stories.length;
        dailyStoryId = stories[todayIndex].id;
        fetchAndPlay(dailyStoryId, true);
        renderSidebar(stories);
    }
}

async function fetchAndPlay(storyId, isDailyFree = false) {
    const frame = document.getElementById('storyFrame');
    const overlay = document.getElementById('lockOverlay');

    if (userStatus === 'paid' || isDailyFree || storyId === dailyStoryId) {
        if (overlay) overlay.classList.add('hidden');
        if (frame.src.startsWith('blob:')) URL.revokeObjectURL(frame.src);

        const { data: story } = await _supabase.from('stories').select('*').eq('id', storyId).single();
        if (!story) return;

        const storyHtml = `
        <html>
        <head>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;600&display=swap');
                body { margin:0; background:#FDFBF7; font-family:'Hind Siliguri', sans-serif; display:flex; align-items:center; justify-content:center; min-height:100vh; padding: 25px; box-sizing: border-box; }
                .card { background:white; padding:40px; border-radius:35px; width:100%; max-width: 800px; box-shadow:0 10px 30px rgba(0,0,0,0.05); }
                h1 { color:#2E7D32; text-align:center; font-size:2rem; margin-top:0; }
                .text { line-height:2; font-size:1.45rem; color:#333; text-align:justify; }
            </style>
        </head>
        <body>
            <div class="card">
                <h1>${story.title}</h1>
                <div class="text">${story.content.replace(/\n/g, '<br>')}</div>
            </div>
        </body>
        </html>`;
        frame.src = URL.createObjectURL(new Blob([storyHtml], { type: 'text/html' }));
    } else {
        frame.src = "about:blank";
        if (overlay) overlay.classList.remove('hidden');
    }
}

function renderSidebar(stories) {
    const list = document.getElementById('storyList');
    if(!list) return;
    list.innerHTML = '';
    const colors = ['#FFD1DC', '#D1F2EB', '#FFF4BD', '#E1F5FE', '#F3E5F5', '#FFF9C4', '#E8F5E9', '#FCE4EC', '#F1F8E9', '#E0F2F1'];

    stories.forEach((s, index) => {
        const banner = document.createElement('div');
        banner.className = 'story-banner';
        banner.style.backgroundColor = colors[index % colors.length];
        banner.innerHTML = `<div>${s.title}</div>`;
        banner.onclick = () => { 
            fetchAndPlay(s.id); 
            if(window.innerWidth < 1100) document.getElementById('playerArea').scrollIntoView({ behavior: 'smooth' });
        };
        list.appendChild(banner);
    });
}

// Fullscreen & PWA Logic
document.getElementById('fullscreenBtn')?.addEventListener('click', () => {
    const playerArea = document.getElementById('playerArea');
    if (!document.fullscreenElement) {
        playerArea.requestFullscreen?.() || playerArea.webkitRequestFullscreen?.();
    } else { document.exitFullscreen?.(); }
});

const installBtn = document.getElementById('installPwa');
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    if (installBtn) installBtn.classList.remove('hidden');
});

if (installBtn) {
    installBtn.addEventListener('click', async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') installBtn.classList.add('hidden');
            deferredPrompt = null;
        }
    });
}

document.addEventListener('DOMContentLoaded', initApp);
