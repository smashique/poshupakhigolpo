const SUPABASE_URL = 'https://xptwwlrcygimfislsutz.supabase.co'.trim(); 
const SUPABASE_ANON_KEY = 'sb_publishable_N0YqY-tMEW_KWxFdS7zgVA_3CgR8Go-'.trim();
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let userStatus = 'free'; 
let dailyStoryId = null;
let deferredPrompt; 

// ১. অ্যাপ শুরু এবং ইউজার চেক
async function initApp() {
    let uuid = localStorage.getItem('device_uuid') || self.crypto.randomUUID();
    localStorage.setItem('device_uuid', uuid);
    if(document.getElementById('footerUid')) document.getElementById('footerUid').innerText = uuid;

    try {
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

// ২. ডেইলি অটো-লোড লজিক
async function loadStories() {
    const { data: stories, error } = await _supabase.from('stories').select('*').order('created_at', { ascending: true });
    if (stories && stories.length > 0) {
        const today = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
        const index = today % stories.length;
        const todayStory = stories[index];
        dailyStoryId = todayStory.id;
        
        playStory(todayStory, true); 
        renderSidebar(stories);
    }
}

// ৩. জাদুকরী গল্প প্রদর্শন (Psychological Infinite Loop Logic)
function playStory(story, isDailyFree = false) {
    const frame = document.getElementById('storyFrame');
    const overlay = document.getElementById('lockOverlay');
    
    if (userStatus === 'paid' || isDailyFree || story.id === dailyStoryId) {
        overlay.classList.add('hidden');

        // ড্রিম ল্যান্ডস্কেপ জেনারেটর
        const landscapes = [
            'linear-gradient(180deg, #a1c4fd 0%, #c2e9fb 100%)', // আকাশ
            'linear-gradient(180deg, #09203f 0%, #537895 100%)', // সমুদ্রের তলদেশ
            'linear-gradient(180deg, #84fab0 0%, #8fd3f4 100%)', // সবুজ দ্বীপ
            'linear-gradient(180deg, #fbc2eb 0%, #a6c1ee 100%)'  // গোধূলি বেলা
        ];
        
        // অবজেক্ট সিলেকশন (চেহারা ছাড়া কিউট এলিমেন্ট)
        const items = ['🚀', '🎈', '☁️', '🐚', '🪸', '⛰️', '🏝️', '✈️', '⛵', '⭐'];
        const randomBg = landscapes[Math.floor(Math.random() * landscapes.length)];

        // আইফ্রেমের ভেতরে ইনজেক্ট করার জন্য জাদুকরী HTML
        const storyHtml = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;600&display=swap');
                body {
                    margin: 0; padding: 0; height: 100vh; overflow: hidden;
                    font-family: 'Hind Siliguri', sans-serif;
                    background: ${randomBg};
                    display: flex; align-items: center; justify-content: center;
                    perspective: 1000px;
                }
                
                /* ব্যাকগ্রাউন্ড স্লো জুম এনিমেশন (৫ মিনিট লুপ) */
                .world-wrap {
                    position: absolute; width: 100%; height: 100%;
                    animation: slowBreathing 300s infinite ease-in-out;
                    z-index: 1;
                }

                @keyframes slowBreathing {
                    0%, 100% { transform: scale(1.0); }
                    50% { transform: scale(1.15); }
                }

                /* ফ্লোটিং অবজেক্টস */
                .obj {
                    position: absolute; opacity: 0.6; font-size: 3rem;
                    animation: floatObj 20s infinite ease-in-out;
                }

                @keyframes floatObj {
                    0%, 100% { transform: translate(0, 0) rotate(0deg); }
                    33% { transform: translate(30px, -50px) rotate(10deg); }
                    66% { transform: translate(-20px, 20px) rotate(-10deg); }
                }

                /* গল্পের কার্ড */
                .content-card {
                    position: relative; z-index: 10;
                    background: rgba(255, 255, 255, 0.92);
                    backdrop-filter: blur(10px);
                    padding: 40px; border-radius: 40px;
                    max-width: 75%; max-height: 80vh;
                    overflow-y: auto; text-align: justify;
                    box-shadow: 0 30px 100px rgba(0,0,0,0.1);
                    line-height: 2; font-size: 1.5rem; color: #263238;
                    border: 2px solid rgba(255,255,255,0.5);
                }
                
                .content-card h1 { color: #2E7D32; text-align: center; font-size: 2.2rem; }
                ::-webkit-scrollbar { width: 8px; }
                ::-webkit-scrollbar-thumb { background: #C8E6C9; border-radius: 10px; }
            </style>
        </head>
        <body>
            <div class="world-wrap">
                ${Array(12).fill().map(() => `
                    <div class="obj" style="
                        top: ${Math.random() * 90}%; 
                        left: ${Math.random() * 90}%; 
                        animation-delay: ${Math.random() * 10}s;
                        font-size: ${2 + Math.random() * 4}rem;
                    ">
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

// ৪. সাইডবার রেন্ডারিং
function renderSidebar(stories) {
    const list = document.getElementById('storyList');
    if(!list) return;
    list.innerHTML = '';
    stories.forEach(s => {
        const banner = document.createElement('div');
        banner.className = 'story-banner';
        banner.style.backgroundImage = `url('${s.thumbnail_url || 'assets/logo.svg'}')`;
        const lock = (userStatus === 'free' && s.id !== dailyStoryId) ? '🔒 ' : '';
        banner.innerHTML = `<div style="background:rgba(255,255,255,0.85); color:#333; padding:12px; width:100%; font-weight:600;">${lock}${s.title}</div>`;
        banner.onclick = () => { playStory(s); window.scrollTo(0,0); };
        list.appendChild(banner);
    });
}

// ৫. ফুল-স্কিন সাপোর্ট
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

// ৬. PWA ইন্সটলেশন
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

// সার্ভিস ওয়ার্কার
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(err => console.log('SW Error:', err));
    });
}

window.initPayment = () => window.location.href = "checkout.html";
document.addEventListener('DOMContentLoaded', initApp);
