/* --- PoshuPakhi Golpo - Stability Update v28.4 --- */
const SUPABASE_URL = 'https://xptwwlrcygimfislsutz.supabase.co'.trim(); 
const SUPABASE_ANON_KEY = 'sb_publishable_N0YqY-tMEW_KWxFdS7zgVA_3CgR8Go-'.trim();
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let userStatus = 'free'; 
let dailyStoryId = null;
let currentStoryTitle = "";
let deferredPrompt;

// ১. পপ সাউন্ড ফিক্স: ইউজার গেসচারের পর অডিও কন্টেক্সট চালু হবে
const playPopSound = () => {
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        const ctx = new AudioContext();
        if (ctx.state === 'suspended') ctx.resume();

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        osc.connect(gain); gain.connect(ctx.destination);
        osc.start(); osc.stop(ctx.currentTime + 0.2);
    } catch (e) { console.log("Audio gesture required."); }
};

// ২. ভিজ্যুয়াল রিওয়ার্ডস (সেন্টার্ড অ্যানিমেশন)
const triggerMagic = () => {
    const items = ['🎈', '🪁', '🐦', '🌸'];
    for (let i = 0; i < 10; i++) {
        const el = document.createElement('div');
        el.className = 'magic-item';
        el.innerText = items[Math.floor(Math.random() * items.length)];
        el.style.left = Math.random() * 100 + 'vw';
        el.style.animationDuration = (Math.random() * 2 + 2) + 's';
        document.body.appendChild(el);
        setTimeout(() => el.remove(), 4000);
    }
};

// ৩. পেমেন্ট ইউআরএল ফিক্স (Valid absolute path)
window.initPayment = () => { 
    const path = window.location.origin + '/payment.html';
    window.location.assign(path); 
};

window.shareApp = async () => {
    if (!currentStoryTitle) return alert("গল্প পড়তে শুরু করুন!");
    const msg = `📖 '${currentStoryTitle}' - সোনামণির জন্য চমৎকার গল্প! ✨\n🔗 ${window.location.origin}`;
    if (navigator.share) {
        try { await navigator.share({ title: 'পশুপাখি গল্প', text: msg }); } catch (e) {}
    } else {
        navigator.clipboard.writeText(msg); alert("লিঙ্ক কপি হয়েছে!");
    }
};

// ৪. স্টোরি ইঞ্জিন (অটো-লোড হ্যান্ডলিং ও স্ক্রলিং)
async function fetchAndPlay(storyId, isDailyFree = false, isAutoLoad = false) {
    if (!isAutoLoad) { playPopSound(); triggerMagic(); }

    const playerArea = document.getElementById('playerArea');
    if (window.innerWidth < 1000 && !isAutoLoad) {
        playerArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    const frame = document.getElementById('storyFrame');
    const { data: story } = await _supabase.from('stories').select('*').eq('id', storyId).single();
    if (!story) return;

    currentStoryTitle = story.title;
    let content = (userStatus === 'paid' || isDailyFree || storyId === dailyStoryId) 
        ? story.content 
        : story.content.substring(0, Math.floor(story.content.length * 0.2)) + "...";

    const storyHtml = `
    <html>
    <head>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;700&display=swap');
            body { margin:0; background:#FDFBF7; font-family:'Hind Siliguri', sans-serif; padding:25px; user-select:none; }
            .card { background:white; padding:35px; border-radius:30px; box-shadow:0 10px 30px rgba(0,0,0,0.03); border: 2px solid #E8F5E9; text-align:center; }
            h1 { color:#2E7D32; font-size: 1.5rem; margin-bottom: 20px; border-bottom: 2px dashed #2E7D32; padding-bottom: 10px; }
            p { line-height:2; font-size:1.35rem; color:#333; text-align:justify; }
            .m-box { background:#f0fdf4; padding:25px; border-radius:20px; border:2px dashed #2E7D32; margin-top:25px; display: flex; flex-direction: column; align-items: center; }
            .btn { background:#2E7D32; color:white; border:none; padding:15px 35px; border-radius:50px; font-weight:bold; cursor:pointer; font-family:'Hind Siliguri'; }
        </style>
    </head>
    <body>
        <div class="card">
            <h1>${story.title}</h1>
            <p>${content.replace(/\n/g, '<br>')}</p>
            ${content.length < story.content.length ? `
            <div class="m-box">
                <strong style="color:#166534">বাকি অংশ পড়তে আজীবনের জন্য আনলক করুন।</strong><br>
                <button onclick="window.parent.initPayment()" class="btn">আনলক করুন</button>
            </div>` : ''}
        </div>
    </body>
    </html>`;
    frame.src = URL.createObjectURL(new Blob([storyHtml], { type: 'text/html' }));
}

async function initApp() {
    let uuid = localStorage.getItem('device_uuid') || self.crypto.randomUUID();
    localStorage.setItem('device_uuid', uuid);
    if(document.getElementById('footerUid')) document.getElementById('footerUid').innerText = uuid;

    try {
        const { count: paidCount } = await _supabase.from('users').select('*', { count: 'exact', head: true }).eq('status', 'paid');
        if(paidCount && document.getElementById('paidCount')) {
            document.getElementById('paidCount').innerText = paidCount;
            document.getElementById('trustBox').classList.remove('hidden');
        }
        const { data: user } = await _supabase.from('users').select('status').eq('device_uuid', uuid).maybeSingle();
        if (user?.status === 'paid') userStatus = 'paid';
        const { data: stories } = await _supabase.from('stories').select('id, title').order('created_at', { ascending: true });
        if (stories) {
            dailyStoryId = stories[Math.floor(Date.now() / 86400000) % stories.length].id;
            fetchAndPlay(dailyStoryId, true, true); // AutoLoad true
            renderSidebar(stories);
        }
    } catch (e) { console.error(e); }
}

function renderSidebar(stories) {
    const list = document.getElementById('storyList');
    if(!list) return; list.innerHTML = '';
    const colors = ['#FFD1DC', '#D1F2EB', '#FFF4BD', '#E1F5FE'];
    stories.forEach((s, i) => {
        const div = document.createElement('div');
        div.className = 'story-banner';
        div.style.backgroundColor = colors[i % colors.length];
        div.innerHTML = `<div>${(userStatus === 'free' && s.id !== dailyStoryId) ? '🔒 ' : ''}${s.title}</div>`;
        div.onclick = () => fetchAndPlay(s.id);
        list.appendChild(div);
    });
}

document.addEventListener('DOMContentLoaded', initApp);
