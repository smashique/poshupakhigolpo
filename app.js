/* --- PoshuPakhi Golpo - Magical Logic v16.0 --- */
const SUPABASE_URL = 'https://xptwwlrcygimfislsutz.supabase.co'.trim(); 
const SUPABASE_ANON_KEY = 'sb_publishable_N0YqY-tMEW_KWxFdS7zgVA_3CgR8Go-'.trim();
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let userStatus = 'free'; 
let dailyStoryId = null;
let deferredPrompt; 

// ১. অ্যাপ শুরু এবং গ্লোবাল ম্যাজিক জেনারেশন
async function initApp() {
    createGlobalMagic(); 
    
    let uuid = localStorage.getItem('device_uuid') || self.crypto.randomUUID();
    localStorage.setItem('device_uuid', uuid);
    if(document.getElementById('footerUid')) document.getElementById('footerUid').innerText = uuid;

    try {
        // মোট গল্পের সংখ্যা রিড করা (FOMO Badge এর জন্য)
        const { count } = await _supabase.from('stories').select('*', { count: 'exact', head: true });
        if (document.getElementById('totalCount')) {
            document.querySelectorAll('#totalCount').forEach(el => el.innerText = count || 0);
        }

        const { data: user } = await _supabase.from('users').select('status').eq('device_uuid', uuid).maybeSingle();
        if (user?.status === 'paid') {
            userStatus = 'paid';
            document.querySelectorAll('.premium-banner, .lock-overlay').forEach(el => el.style.display = 'none');
        }
        loadStories();
    } catch (err) { console.error("Init Error:", err.message); }
}

// ২. পুরো সাইটের জন্য র‍্যান্ডম অ্যানিমেশন অবজেক্ট
function createGlobalMagic() {
    const layer = document.getElementById('globalMagicLayer');
    if(!layer) return;
    const items = ['🚀', '🎈', '☁️', '☁️', '⭐', '🎈', '🐚', '⛵'];
    
    for(let i=0; i<12; i++) {
        const div = document.createElement('div');
        div.className = 'magic-obj'; // আপনার style.css এ এর এনিমেশন থাকতে হবে
        div.innerText = items[Math.floor(Math.random() * items.length)];
        div.style.position = 'fixed';
        div.style.zIndex = '-1';
        div.style.top = Math.random() * 90 + 'vh';
        div.style.left = Math.random() * 95 + 'vw';
        div.style.fontSize = (Math.random() * 2 + 1.5) + 'rem';
        div.style.opacity = '0.3';
        div.style.pointerEvents = 'none';
        layer.appendChild(div);
    }
}

// ৩. স্টোরি প্লে লজিক (৫ মিনিটের জাদুকরী লুপ)
async function fetchAndPlay(storyId, isDailyFree = false) {
    const frame = document.getElementById('storyFrame');
    const overlay = document.getElementById('lockOverlay');

    if (userStatus === 'paid' || isDailyFree || storyId === dailyStoryId) {
        if (overlay) overlay.classList.add('hidden');
        
        // মেমরি ম্যানেজমেন্ট: আগের Blob URL রিলিজ করা
        if (frame.src.startsWith('blob:')) URL.revokeObjectURL(frame.src);

        const { data: story } = await _supabase.from('stories').select('*').eq('id', storyId).single();
        if (!story) return;

        const landscapes = [
            'linear-gradient(180deg, #a1c4fd 0%, #c2e9fb 100%)', 
            'linear-gradient(180deg, #84fab0 0%, #8fd3f4 100%)',
            'linear-gradient(180deg, #fbc2eb 0%, #a6c1ee 100%)'
        ];
        const items = ['🚀', '🎈', '☁️', '🐚', '🪸', '⛰️', '🏝️', '✈️', '⛵', '⭐'];
        const randomBg = landscapes[Math.floor(Math.random() * landscapes.length)];

        const storyHtml = `
        <html>
        <head>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;600&display=swap');
                body { margin:0; background:${randomBg}; font-family:'Hind Siliguri', sans-serif; display:flex; align-items:center; justify-content:center; height:100vh; overflow:hidden; }
                .world-wrap { position:absolute; width:100%; height:100%; animation:zoom 300s infinite ease-in-out; }
                @keyframes zoom { 0%, 100% { transform:scale(1); } 50% { transform:scale(1.15); } }
                .obj { position:absolute; opacity:0.5; animation:float 20s infinite ease-in-out; }
                @keyframes float { 0%, 100% { transform:translate(0,0) rotate(0deg); } 50% { transform:translate(20px,-40px) rotate(10deg); } }
                .card { position:relative; z-index:10; background:rgba(255,255,255,0.92); backdrop-filter:blur(10px); padding:40px; border-radius:40px; max-width:80%; max-height:80vh; overflow-y:auto; box-shadow:0 30px 80px rgba(0,0,0,0.1); font-size:1.5rem; line-height:2; color:#333; text-align:justify; border:2px solid rgba(255,255,255,0.5); }
                h1 { color:#2E7D32; text-align:center; margin-top:0; font-size:2.2rem; }
                ::-webkit-scrollbar { width:8px; }
                ::-webkit-scrollbar-thumb { background:#C8E6C9; border-radius:10px; }
            </style>
        </head>
        <body>
            <div class="world-wrap">
                ${Array(10).fill().map(() => `
                    <div class="obj" style="top:${Math.random()*90}%; left:${Math.random()*90}%; animation-delay:${Math.random()*10}s; font-size:${2+Math.random()*3}rem;">
                        ${items[Math.floor(Math.random()*items.length)]}
                    </div>
                `).join('')}
            </div>
            <div class="card">
                <h1>${story.title}</h1>
                ${story.content.replace(/\n/g, '<br>')}
            </div>
        </body>
        </html>`;
        frame.src = URL.createObjectURL(new Blob([storyHtml], { type: 'text/html' }));
    } else {
        frame.src = "about:blank";
        if (overlay) overlay.classList.remove('hidden');
    }
}

// ৪. সাইডবার রেন্ডারিং (Fixed 10-item frame & Text wrap fix)
function renderSidebar(stories) {
    const list = document.getElementById('storyList');
    if(!list) return;
    list.innerHTML = '';

    const colors = ['#FFADAD', '#FFD6A5', '#FDFFB6', '#CAFFBF', '#9BF6FF', '#A0C4FF', '#BDB2FF', '#FFC6FF', '#FFFFFC', '#C0FDFF'];

    stories.forEach((s, index) => {
        const banner = document.createElement('div');
        banner.className = 'story-banner';
        banner.style.backgroundColor = colors[index % colors.length];
        banner.style.minHeight = "55px"; 
        banner.style.display = "flex";
        banner.style.alignItems = "center";
        banner.style.justifyContent = "center";
        banner.style.padding = "10px";
        banner.style.marginBottom = "10px";
        banner.style.borderRadius = "15px";
        banner.style.cursor = "pointer";

        // টেক্সট যাতে বক্সের বাইরে না যায়
        banner.innerHTML = `<div style="font-weight:700; color:#333; text-align:center; font-size:1rem; word-wrap:break-word;">${s.title}</div>`;
        
        banner.onclick = () => { 
            fetchAndPlay(s.id); 
            if(window.innerWidth < 1100) {
                document.getElementById('playerArea').scrollIntoView({ behavior: 'smooth' });
            }
        };
        list.appendChild(banner);
    });
}

// ৫. ডাটা লোড ও ডেইলি ফ্রি লজিক
async function loadStories() {
    const { data: stories } = await _supabase.from('stories').select('id, title, created_at').order('created_at', { ascending: true });
    if (stories) {
        const todayIndex = Math.floor(Date.now() / 86400000) % stories.length;
        dailyStoryId = stories[todayIndex].id;
        fetchAndPlay(dailyStoryId, true);
        renderSidebar(stories);
    }
}

// ৬. ফুল-স্ক্রিন, শেয়ার ও PWA লজিক
document.getElementById('fullscreenBtn')?.addEventListener('click', () => {
    const playerArea = document.getElementById('playerArea');
    if (!document.fullscreenElement) {
        playerArea.requestFullscreen?.() || playerArea.webkitRequestFullscreen?.();
    } else {
        document.exitFullscreen?.();
    }
});

window.shareApp = async () => {
    if (navigator.share) {
        try {
            await navigator.share({
                title: 'পশুপাখি গল্প',
                text: 'আমার সোনামণি এখান থেকে নৈতিক গল্প শুনছে। আপনিও আপনার সোনামণিকে উপহার দিন!',
                url: window.location.origin
            });
        } catch (err) { console.log('Share failed'); }
    } else {
        alert('লিঙ্কটি কপি করে বন্ধুদের পাঠান: ' + window.location.origin);
    }
};

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

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(err => console.log('SW Error'));
    });
}

window.initPayment = () => window.location.href = "checkout.html";
document.addEventListener('DOMContentLoaded', initApp);
