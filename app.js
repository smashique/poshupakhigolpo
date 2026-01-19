/* --- PoshuPakhi Golpo Engine v28.3 --- */
const SUPABASE_URL = 'https://xptwwlrcygimfislsutz.supabase.co'.trim(); 
const SUPABASE_ANON_KEY = 'sb_publishable_N0YqY-tMEW_KWxFdS7zgVA_3CgR8Go-'.trim();
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let userStatus = 'free'; 
let dailyStoryId = null;
let currentStoryTitle = "";
let deferredPrompt;

// পপ সাউন্ড জেনারেটর (Browser Audio Context)
const playPopSound = () => {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start(); osc.stop(ctx.currentTime + 0.2);
};

// ভিজ্যুয়াল রিওয়ার্ডস (বেলুন, ঘুড়ি, পাখি)
const triggerMagic = () => {
    const items = ['🎈', '🪁', '🐦', '🌸'];
    for (let i = 0; i < 12; i++) {
        const el = document.createElement('div');
        el.className = 'magic-item';
        el.innerText = items[Math.floor(Math.random() * items.length)];
        el.style.left = Math.random() * 100 + 'vw';
        el.style.animationDuration = (Math.random() * 2 + 3) + 's';
        document.body.appendChild(el);
        setTimeout(() => el.remove(), 5000);
    }
};

// PWA Logic
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault(); deferredPrompt = e;
    document.getElementById('installPwa')?.classList.remove('hidden');
});

document.getElementById('installPwa')?.addEventListener('click', async () => {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') document.getElementById('installPwa').classList.add('hidden');
        deferredPrompt = null;
    }
});

window.initPayment = () => { window.location.href = 'payment.html'; };

window.shareApp = async () => {
    if (!currentStoryTitle) return alert("আগে একটি গল্প পড়তে শুরু করুন!");
    const msg = `📖 '${currentStoryTitle}' - সোনামণির জন্য একটি চমৎকার শিক্ষামূলক গল্প! ✨\n\nপুরো গল্পটি পড়তে ভিজিট করুন:\n🔗 ${window.location.origin}`;
    if (navigator.share) {
        try { await navigator.share({ title: 'পশুপাখি গল্প', text: msg }); } catch (e) {}
    } else {
        navigator.clipboard.writeText(msg); alert("লিঙ্ক কপি হয়েছে!");
    }
};

// Fullscreen Logic
document.getElementById('fullscreenBtn')?.addEventListener('click', () => {
    const p = document.getElementById('playerArea');
    if (!document.fullscreenElement && !document.webkitFullscreenElement) {
        if (p.requestFullscreen) p.requestFullscreen(); else if (p.webkitRequestFullscreen) p.webkitRequestFullscreen();
    } else {
        if (document.exitFullscreen) document.exitFullscreen(); else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
    }
});

// স্টোরি ইঞ্জিন (২০% প্রিভিউ + মোবাইল স্ক্রলিং)
async function fetchAndPlay(storyId, isDailyFree = false) {
    playPopSound(); triggerMagic();

    const playerArea = document.getElementById('playerArea');
    if (window.innerWidth < 1000) {
        playerArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    const frame = document.getElementById('storyFrame');
    const { data: story } = await _supabase.from('stories').select('*').eq('id', storyId).single();
    if (!story) return;

    currentStoryTitle = story.title;
    let content = "";
    let isLocked = false;

    if (userStatus === 'paid' || isDailyFree || storyId === dailyStoryId) {
        content = story.content;
    } else {
        content = story.content.substring(0, Math.floor(story.content.length * 0.2)) + "...";
        isLocked = true;
    }

    const storyHtml = `
    <html>
    <head>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;700&display=swap');
            body { margin:0; background:#FDFBF7; font-family:'Hind Siliguri', sans-serif; padding:25px; user-select:none; }
            .card { background:white; padding:35px; border-radius:30px; box-shadow:0 10px 30px rgba(0,0,0,0.03); border: 2px solid #E8F5E9; max-width:800px; margin:0 auto; }
            h1 { color:#2E7D32; text-align:center; border-bottom: 2px dashed #2E7D32; padding-bottom:10px; }
            p { line-height:2; font-size:1.35rem; color:#333; text-align:justify; }
            .m-box { background:#f0fdf4; padding:25px; border-radius:20px; border:2px dashed #2E7D32; margin-top:25px; text-align:center; display: flex; flex-direction: column; align-items: center; }
            .price { font-size:1.4rem; font-weight:bold; margin:15px 0; }
            .old { text-decoration:line-through; color:#999; margin-right:10px; }
            .new { color:#d32f2f; background:#fff9c4; padding:2px 10px; border-radius:8px; }
            .btn { background:#2E7D32; color:white; border:none; padding:15px 35px; border-radius:50px; font-weight:bold; cursor:pointer; text-decoration:none; display:inline-block; }
        </style>
    </head>
    <body>
        <div class="card">
            <h1>${story.title}</h1>
            <p>${content.replace(/\n/g, '<br>')}</p>
            ${isLocked ? `
            <div class="m-box">
                <strong style="color:#166534; font-size:1.2rem">মাশাআল্লাহ! আপনার প্রচেষ্টার জন্য মোবারকবাদ!</strong>
                <div style="text-align:left; margin:15px 0; display: inline-block;">
                    ✔ মজার গল্প যা শৈশবকে আনন্দময় করবে।<br>
                    ✔ বিজ্ঞান ও নৈতিক শিক্ষার রোডম্যাপ।<br>
                    ✔ বাইল্যাঙ্গুয়াল দক্ষতা বৃদ্ধি।
                </div>
                <div class="price">অফার: <span class="old">৳৪৯৯</span> <span class="new">৳২৯৯</span></div>
                <button onclick="window.parent.initPayment()" class="btn">আজীবনের জন্য আনলক করুন</button>
                <a href="#" onclick="window.parent.location.reload()" style="display:block; margin-top:15px; color:#666; font-size:0.9rem">আজকের ফ্রি গল্পটি পড়ুন</a>
            </div>` : ''}
        </div>
    </body>
    </html>`;
    frame.src = URL.createObjectURL(new Blob([storyHtml], { type: 'text/html' }));
}

function renderSidebar(stories) {
    const list = document.getElementById('storyList');
    if(!list) return; list.innerHTML = '';
    const colors = ['#FFD1DC', '#D1F2EB', '#FFF4BD', '#E1F5FE'];
    stories.forEach((s, i) => {
        const div = document.createElement('div');
        div.className = 'story-banner';
        div.style.backgroundColor = colors[i % colors.length];
        const locked = (userStatus === 'free' && s.id !== dailyStoryId);
        div.innerHTML = `<div>${locked ? '🔒 ' : ''}${s.title}</div>`;
        div.onclick = () => fetchAndPlay(s.id);
        list.appendChild(div);
    });
}

async function initApp() {
    let uuid = localStorage.getItem('device_uuid') || self.crypto.randomUUID();
    localStorage.setItem('device_uuid', uuid);
    document.getElementById('footerUid').innerText = uuid;

    try {
        const { count: paidCount } = await _supabase.from('users').select('*', { count: 'exact', head: true }).eq('status', 'paid');
        if(paidCount) {
            document.getElementById('paidCount').innerText = paidCount;
            document.getElementById('trustBox').classList.remove('hidden');
        }
        const { data: user } = await _supabase.from('users').select('status').eq('device_uuid', uuid).maybeSingle();
        if (user?.status === 'paid') userStatus = 'paid';
        const { data: stories } = await _supabase.from('stories').select('id, title').order('created_at', { ascending: true });
        if (stories) {
            dailyStoryId = stories[Math.floor(Date.now() / 86400000) % stories.length].id;
            fetchAndPlay(dailyStoryId, true);
            renderSidebar(stories);
        }
    } catch (e) { console.error(e); }
}
document.addEventListener('DOMContentLoaded', initApp);
