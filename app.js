/* --- PoshuPakhi Golpo - Nuromarketers Gamified Edition v28.2 --- */
const SUPABASE_URL = 'https://xptwwlrcygimfislsutz.supabase.co'.trim(); 
const SUPABASE_ANON_KEY = 'sb_publishable_N0YqY-tMEW_KWxFdS7zgVA_3CgR8Go-'.trim();
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let userStatus = 'free'; 
let dailyStoryId = null;
let currentStoryTitle = "";

// ১. পপ সাউন্ড জেনারেটর (No External Assets)
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
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.2);
};

// ২. ভিজ্যুয়াল রিওয়ার্ডস (বেলুন, ঘুড়ি, পাখি ওড়ানো)
const triggerMagic = () => {
    const container = document.body;
    const items = ['🎈', '🪁', '🐦', '🌸'];
    for (let i = 0; i < 15; i++) {
        const el = document.createElement('div');
        el.className = 'magic-item';
        el.innerText = items[Math.floor(Math.random() * items.length)];
        el.style.left = Math.random() * 100 + 'vw';
        el.style.animationDuration = (Math.random() * 3 + 2) + 's';
        el.style.fontSize = (Math.random() * 20 + 20) + 'px';
        container.appendChild(el);
        setTimeout(() => el.remove(), 5000);
    }
};

// ৩. শেয়ার লজিক (ডুপ্লিকেট লিঙ্ক ফিক্স)
window.shareApp = async () => {
    if (!currentStoryTitle) return alert("আগে একটি গল্প পড়তে শুরু করুন!");
    const siteUrl = window.location.origin; 
    const shareMessage = `📖 '${currentStoryTitle}' - সোনামণির জন্য একটি চমৎকার শিক্ষামূলক গল্প! ✨\n\nপুরো গল্পটি পড়তে ভিজিট করুন:\n🔗 ${siteUrl}`;

    if (navigator.share) {
        try { 
            // ডুপ্লিকেট লিঙ্ক এড়াতে শুধুমাত্র text পাঠানো হচ্ছে
            await navigator.share({ 
                title: 'পশুপাখি গল্প ✨', 
                text: shareMessage
            }); 
        } catch (e) { console.log("Sharing cancelled"); }
    } else { 
        navigator.clipboard.writeText(shareMessage);
        alert("লিঙ্ক কপি হয়েছে!"); 
    }
};

// ৪. স্টোরি প্লেয়ার (মোবাইল স্ক্রলিং ফিক্স সহ)
async function fetchAndPlay(storyId, isDailyFree = false) {
    playPopSound(); // বাটন ক্লিকে সাউন্ড
    triggerMagic(); // পাখি ও ঘুড়ি ওড়ানো

    // মোবাইলে প্লেয়ারে অটো স্ক্রল করার জন্য
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
            .card { background:white; padding:35px; border-radius:30px; box-shadow:0 10px 30px rgba(0,0,0,0.03); border: 2px solid #E8F5E9; }
            h1 { color:#2E7D32; text-align:center; font-size: 1.5rem; margin-bottom: 20px; border-bottom: 2px dashed #2E7D32; padding-bottom: 10px; }
            p { line-height:2; font-size:1.35rem; text-align:justify; color:#333; }
            .m-box { background:#f0fdf4; padding:25px; border-radius:20px; border:2px dashed #2E7D32; margin-top:25px; text-align:center; }
            .unlock-btn { background:#2E7D32; color:white; border:none; padding:15px 30px; border-radius:50px; font-weight:bold; cursor:pointer; display:inline-block; text-decoration:none; }
        </style>
    </head>
    <body oncontextmenu="return false;">
        <div class="card">
            <h1>${story.title}</h1>
            <p>${content.replace(/\n/g, '<br>')}</p>
            ${isLocked ? `<div class="m-box">
                <strong style="color:#166534">মাশাআল্লাহ! আপনার প্রচেষ্টার জন্য মোবারকবাদ!</strong>
                <p style="font-size:1rem; margin:15px 0">বাকি অংশ পড়তে আজীবনের জন্য আনলক করুন।</p>
                <div style="font-size:1.4rem; font-weight:bold; margin-bottom:15px"><del style="color:#999">৳৪৯৯</del> <span style="color:#d32f2f">৳২৯৯</span></div>
                <button onclick="window.parent.initPayment()" class="unlock-btn">আনলক করুন</button>
                <a href="#" onclick="window.parent.location.reload()" style="display:block; margin-top:15px; color:#666; font-size:0.9rem">আজকের ফ্রি গল্পটি পড়ুন</a>
            </div>` : ''}
        </div>
    </body>
    </html>`;

    frame.src = URL.createObjectURL(new Blob([storyHtml], { type: 'text/html' }));
}

function renderSidebar(stories) {
    const list = document.getElementById('storyList');
    if(!list) return;
    list.innerHTML = '';
    const colors = ['#FFD1DC', '#D1F2EB', '#FFF4BD', '#E1F5FE'];

    stories.forEach((s, index) => {
        const banner = document.createElement('div');
        banner.className = 'story-banner';
        banner.style.backgroundColor = colors[index % colors.length];
        const isLocked = (userStatus === 'free' && s.id !== dailyStoryId);
        banner.innerHTML = `<div>${isLocked ? '🔒 ' : ''}${s.title}</div>`;
        banner.onclick = () => fetchAndPlay(s.id);
        list.appendChild(banner);
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
    } catch (err) { console.error(err); }
}

document.addEventListener('DOMContentLoaded', initApp);
