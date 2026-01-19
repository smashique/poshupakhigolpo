/* --- PoshuPakhi Golpo - Nuromarketers Gamified v28.6 --- */
const SUPABASE_URL = 'https://xptwwlrcygimfislsutz.supabase.co'.trim(); 
const SUPABASE_ANON_KEY = 'sb_publishable_N0YqY-tMEW_KWxFdS7zgVA_3CgR8Go-'.trim();
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let userStatus = 'free'; 
let dailyStoryId = null;
let currentStoryTitle = "";
let deferredPrompt;

// ১. পপ সাউন্ড লজিক (বেলুন ফাটানোর সময় ব্যবহার হবে)
const playPopSound = () => {
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        const ctx = new AudioContext();
        if (ctx.state === 'suspended') ctx.resume();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        osc.connect(gain); gain.connect(ctx.destination);
        osc.start(); osc.stop(ctx.currentTime + 0.1);
    } catch (e) { console.log("Audio gesture required."); }
};

// ২. অব্যাহত বেলুন অ্যানিমেশন (Slow Motion)
function createFloatingBalloon() {
    const b = document.createElement('div');
    b.className = 'balloon';
    b.innerText = '🎈';
    b.style.left = Math.random() * 90 + 'vw';
    b.style.fontSize = (Math.random() * 20 + 25) + 'px';
    
    // টাচ করলে ফেটে যাবে এবং শব্দ হবে
    b.onclick = (e) => {
        e.stopPropagation();
        playPopSound();
        b.innerText = '💥';
        setTimeout(() => b.remove(), 100);
    };

    document.body.appendChild(b);
    // ২০ সেকেন্ড পর নিজে থেকেই রিমুভ হবে যদি ফাটানো না হয়
    setTimeout(() => { if(b.parentNode) b.remove(); }, 20000);
}

// ৪ সেকেন্ড পরপর একটি নতুন বেলুন আসবে
setInterval(createFloatingBalloon, 4000);

// ৩. স্মার্ট ইন্সটল লজিক
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault(); deferredPrompt = e;
});

const handleInstallClick = async () => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    if (isStandalone) {
        alert("গল্পের অ্যাপটি আপনার ডিভাইসে অলরেডি ইনস্টল করা আছে! ✨");
        return;
    }

    if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') deferredPrompt = null;
    } else {
        alert("অ্যাপটি অলরেডি ইনস্টল করা আছে অথবা আপনার ব্রাউজার এটি সাপোর্ট করছে না।");
    }
};

// ৪. পেমেন্ট ও শেয়ার লজিক
window.initPayment = () => { window.location.assign(window.location.origin + '/payment.html'); };

window.shareApp = async () => {
    if (!currentStoryTitle) return alert("গল্প পড়তে শুরু করুন!");
    const msg = `📖 '${currentStoryTitle}' - সোনামণির জন্য চমৎকার গল্প! ✨\n🔗 ${window.location.origin}`;
    if (navigator.share) {
        try { await navigator.share({ title: 'পশুপাখি গল্প', text: msg }); } catch (e) {}
    } else {
        navigator.clipboard.writeText(msg); alert("লিঙ্ক কপি হয়েছে!");
    }
};

// ৫. স্টোরি ইঞ্জিন
async function fetchAndPlay(storyId, isDailyFree = false, isAutoLoad = false) {
    const playerArea = document.getElementById('playerArea');
    if (window.innerWidth < 1000 && !isAutoLoad) {
        playerArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    const frame = document.getElementById('storyFrame');
    const { data: story } = await _supabase.from('stories').select('*').eq('id', storyId).single();
    if (!story) return;

    currentStoryTitle = story.title;
    let isLocked = false;
    let content = (userStatus === 'paid' || isDailyFree || storyId === dailyStoryId) 
        ? story.content 
        : story.content.substring(0, Math.floor(story.content.length * 0.2)) + "...";

    if (content.length < story.content.length) isLocked = true;

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
            .btn { background:#2E7D32; color:white; border:none; padding:15px 35px; border-radius:50px; font-weight:bold; cursor:pointer; font-family:'Hind Siliguri'; font-size:1.1rem; }
            .benefit-list { text-align: left; font-size: 1.05rem; color: #444; margin: 15px 0; line-height: 1.6; }
        </style>
    </head>
    <body>
        <div class="card">
            <h1>${story.title}</h1>
            <p>${content.replace(/\n/g, '<br>')}</p>
            ${isLocked ? `
            <div class="m-box">
                <strong style="color: #1b5e20; font-size: 1.2rem;">মাশাআল্লাহ! আপনার প্রচেষ্টার জন্য মোবারকবাদ!</strong>
                <div class="benefit-list">
                    ✔ পশু-পাখিদের মজার গল্প যা শৈশবকে আনন্দময় করবে।<br>
                    ✔ ইতিহাস, বিজ্ঞান ও মহামানবদের জীবনী থেকে শিক্ষার রোডম্যাপ।<br>
                    ✔ বাংলা-ইংরেজি দুই ভাষায় ইংরেজি দক্ষতা বাড়বে ইনশাআল্লাহ।
                </div>
                <div style="font-size:1.4rem; font-weight:bold; margin-bottom:15px">অফার: <del style="color:#999">৳৪৯৯</del> <span style="color:#d32f2f">৳২৯৯</span></div>
                <button onclick="window.parent.initPayment()" class="btn">আজীবনের জন্য আনলক করুন</button>
                <a href="#" onclick="window.parent.location.reload()" style="display:block; margin-top:15px; color:#2E7D32; font-weight:bold; text-decoration:none;">আজকের ফ্রি গল্পটি পড়ুন</a>
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

    document.getElementById('installPwa')?.addEventListener('click', handleInstallClick);
    document.getElementById('fullscreenBtn')?.addEventListener('click', () => {
        const p = document.getElementById('playerArea');
        if (!document.fullscreenElement && !document.webkitFullscreenElement) {
            p.requestFullscreen?.() || p.webkitRequestFullscreen?.();
        } else {
            document.exitFullscreen?.() || document.webkitExitFullscreen?.();
        }
    });

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
            fetchAndPlay(dailyStoryId, true, true);
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
