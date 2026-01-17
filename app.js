/* --- PoshuPakhi Golpo - Core Logic v14.0 --- */
const SUPABASE_URL = 'https://xptwwlrcygimfislsutz.supabase.co'.trim(); 
const SUPABASE_ANON_KEY = 'sb_publishable_N0YqY-tMEW_KWxFdS7zgVA_3CgR8Go-'.trim();
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let userStatus = 'free'; 
let dailyStoryId = null;
let deferredPrompt; 
let allStories = []; // মেমরিতে গল্পের লিস্ট রাখার জন্য

// ১. অ্যাপ শুরু এবং ইউজার চেক
async function initApp() {
    let uuid = localStorage.getItem('device_uuid') || self.crypto.randomUUID();
    localStorage.setItem('device_uuid', uuid);
    if(document.getElementById('footerUid')) document.getElementById('footerUid').innerText = uuid;

    try {
        // মোট গল্পের সংখ্যা রিড করা
        const { count, error: countError } = await _supabase
            .from('stories')
            .select('*', { count: 'exact', head: true });

        if (!countError && document.getElementById('totalCount')) {
            document.getElementById('totalCount').innerText = count || 0;
        }

        const { data: user } = await _supabase.from('users').select('status').eq('device_uuid', uuid).maybeSingle();
        if (!user) {
            await _supabase.from('users').insert([{ device_uuid: uuid, status: 'free' }]);
        } else if (user.status === 'paid') {
            userStatus = 'paid';
            document.querySelectorAll('.premium-banner, .lock-overlay').forEach(el => el.style.display = 'none');
        }
        loadStories();
    } catch (err) {
        console.error("ইনিট এরর:", err.message);
    }
}

// ২. অপ্টিমাইজড লোড লজিক (শুধুমাত্র টাইটেল এবং থাম্বনেইল লোড হবে)
async function loadStories() {
    // এখানে content লোড করা হচ্ছে না যাতে ডাটা খরচ কম হয়
    const { data: stories, error } = await _supabase
        .from('stories')
        .select('id, title, thumbnail_url, created_at')
        .order('created_at', { ascending: true });

    if (stories && stories.length > 0) {
        allStories = stories;
        const today = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
        const index = today % stories.length;
        const todayStory = stories[index];
        dailyStoryId = todayStory.id;
        
        // প্রথমবার ডেইলি ফ্রি গল্পটি লোড করো
        fetchAndPlay(todayStory.id, true); 
        renderSidebar(stories);
    }
}

// ৩. গল্পটি ডাটাবেস থেকে টেনে আনা এবং প্লে করা
async function fetchAndPlay(storyId, isDailyFree = false) {
    const frame = document.getElementById('storyFrame');
    const overlay = document.getElementById('lockOverlay');

    // ইউজার কি এটি পড়ার অনুমতি পায়?
    if (userStatus === 'paid' || isDailyFree || storyId === dailyStoryId) {
        overlay.classList.add('hidden');
        
        // মেমরি ম্যানেজমেন্ট: আগের Blob URL রিলিজ করা
        if (frame.src.startsWith('blob:')) {
            URL.revokeObjectURL(frame.src);
        }

        // এখন ডাটাবেস থেকে গল্পের মূল কন্টেন্ট আনা
        const { data: story, error } = await _supabase
            .from('stories')
            .select('*')
            .eq('id', storyId)
            .single();

        if (error) return console.error("গল্প লোড করতে সমস্যা:", error.message);

        // জাদুকরী HTML তৈরি
        const landscapes = [
            'linear-gradient(180deg, #a1c4fd 0%, #c2e9fb 100%)', // আকাশ
            'linear-gradient(180deg, #09203f 0%, #537895 100%)', // সমুদ্র
            'linear-gradient(180deg, #84fab0 0%, #8fd3f4 100%)', // দ্বীপ
            'linear-gradient(180deg, #fbc2eb 0%, #a6c1ee 100%)'  // গোধূলি
        ];
        const items = ['🚀', '🎈', '☁️', '🐚', '🪸', '⛰️', '🏝️', '✈️', '⛵', '⭐'];
        const randomBg = landscapes[Math.floor(Math.random() * landscapes.length)];

        const storyHtml = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;600&display=swap');
                body { margin: 0; padding: 0; height: 100vh; overflow: hidden; font-family: 'Hind Siliguri', sans-serif; background: ${randomBg}; display: flex; align-items: center; justify-content: center; }
                .world-wrap { position: absolute; width: 100%; height: 100%; animation: slowBreathing 300s infinite ease-in-out; z-index: 1; }
                @keyframes slowBreathing { 0%, 100% { transform: scale(1.0); } 50% { transform: scale(1.12); } }
                .obj { position: absolute; opacity: 0.6; animation: floatObj 20s infinite ease-in-out; }
                @keyframes floatObj { 0%, 100% { transform: translate(0, 0) rotate(0deg); } 50% { transform: translate(20px, -40px) rotate(10deg); } }
                .content-card { position: relative; z-index: 10; background: rgba(255, 255, 255, 0.94); backdrop-filter: blur(8px); padding: 40px; border-radius: 40px; max-width: 78%; max-height: 82vh; overflow-y: auto; text-align: justify; box-shadow: 0 30px 80px rgba(0,0,0,0.08); line-height: 2; font-size: 1.55rem; color: #263238; border: 2px solid rgba(255,255,255,0.5); }
                .content-card h1 { color: #2E7D32; text-align: center; font-size: 2.3rem; margin-top: 0; }
                ::-webkit-scrollbar { width: 8px; }
                ::-webkit-scrollbar-thumb { background: #C8E6C9; border-radius: 10px; }
            </style>
        </head>
        <body>
            <div class="world-wrap">
                ${Array(12).fill().map(() => `
                    <div class="obj" style="top: ${Math.random() * 90}%; left: ${Math.random() * 90}%; animation-delay: ${Math.random() * 8}s; font-size: ${2 + Math.random() * 3}rem;">
                        ${items[Math.floor(Math.random() * items.length)]}
                    </div>
                `).join('')}
            </div>
            <div class="content-card">
                <h1>${story.title}</h1>
                ${story.content.replace(/\n/g, '<br>')}
            </div>
        </body>
        </html>`;

        frame.src = URL.createObjectURL(new Blob([storyHtml], { type: 'text/html' }));
    } else {
        frame.src = "about:blank";
        overlay.classList.remove('hidden');
    }
}

// ৪. সাইডবার রেন্ডারিং (ফিক্সড ফ্রেম ও স্ক্রলিং সাপোর্ট)
function renderSidebar(stories) {
    const list = document.getElementById('storyList');
    if(!list) return;
    list.innerHTML = '';
    stories.forEach(s => {
        const banner = document.createElement('div');
        banner.className = 'story-banner';
        banner.style.backgroundImage = `url('${s.thumbnail_url || 'assets/logo.svg'}')`;
        const lock = (userStatus === 'free' && s.id !== dailyStoryId) ? '🔒 ' : '';
        banner.innerHTML = `<div style="background:rgba(255,255,255,0.9); color:#333; padding:12px; width:100%; font-weight:600; font-size:0.95rem;">${lock}${s.title}</div>`;
        banner.onclick = () => { fetchAndPlay(s.id); window.scrollTo(0,0); };
        list.appendChild(banner);
    });
}

// ৫. ফুল-স্কিন ও পেমেন্ট লজিক
document.getElementById('fullscreenBtn').addEventListener('click', () => {
    const playerArea = document.getElementById('playerArea');
    if (!document.fullscreenElement) {
        playerArea.requestFullscreen?.() || playerArea.webkitRequestFullscreen?.();
        document.getElementById('fullscreenBtn').innerText = "❌ ছোট করো";
    } else {
        document.exitFullscreen?.();
        document.getElementById('fullscreenBtn').innerText = "📺 বড় পর্দায় পড়ো";
    }
});

// ৬. শেয়ার লজিক (Experts' Recommended)
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

// ৭. PWA ইন্সটলেশন
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
