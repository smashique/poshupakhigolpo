/* --- PoshuPakhi Golpo - Magical Logic v15.0 --- */
const SUPABASE_URL = 'https://xptwwlrcygimfislsutz.supabase.co'.trim(); 
const SUPABASE_ANON_KEY = 'sb_publishable_N0YqY-tMEW_KWxFdS7zgVA_3CgR8Go-'.trim();
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let userStatus = 'free'; 
let dailyStoryId = null;

// ১. অ্যাপ শুরু এবং গ্লোবাল ম্যাজিক জেনারেশন
async function initApp() {
    createGlobalMagic(); // পুরো সাইটে জাদুকরী অবজেক্ট তৈরি
    
    let uuid = localStorage.getItem('device_uuid') || self.crypto.randomUUID();
    localStorage.setItem('device_uuid', uuid);

    try {
        const { count } = await _supabase.from('stories').select('*', { count: 'exact', head: true });
        if (document.getElementById('totalCount')) document.getElementById('totalCount').innerText = count || 0;

        const { data: user } = await _supabase.from('users').select('status').eq('device_uuid', uuid).maybeSingle();
        if (user?.status === 'paid') {
            userStatus = 'paid';
            document.querySelectorAll('.premium-banner, .lock-overlay').forEach(el => el.style.display = 'none');
        }
        loadStories();
    } catch (err) { console.error(err); }
}

// ২. পুরো সাইটের জন্য র‍্যান্ডম অ্যানিমেশন অবজেক্ট
function createGlobalMagic() {
    const layer = document.getElementById('globalMagicLayer');
    if(!layer) return;
    const items = ['🚀', '🎈', '☁️', '☁️', '⭐', '🎈'];
    
    for(let i=0; i<8; i++) {
        const div = document.createElement('div');
        div.className = 'magic-obj';
        div.innerText = items[Math.floor(Math.random() * items.length)];
        div.style.top = Math.random() * 90 + 'vh';
        div.style.left = Math.random() * 90 + 'vw';
        div.style.fontSize = (Math.random() * 3 + 2) + 'rem';
        div.style.animationDelay = (Math.random() * 10) + 's';
        layer.appendChild(div);
    }
}

// ৩. স্টোরি লোড ও প্লে (আইফ্রেমের জাদুকরী লুপ বজায় রাখা হয়েছে)
async function fetchAndPlay(storyId, isDailyFree = false) {
    const frame = document.getElementById('storyFrame');
    if (userStatus === 'paid' || isDailyFree || storyId === dailyStoryId) {
        const { data: story } = await _supabase.from('stories').select('*').eq('id', storyId).single();
        
        const randomBg = ['linear-gradient(180deg, #a1c4fd 0%, #c2e9fb 100%)', 'linear-gradient(180deg, #84fab0 0%, #8fd3f4 100%)'][Math.floor(Math.random()*2)];
        
        const storyHtml = `
        <html>
        <body style="margin:0; background:${randomBg}; font-family:sans-serif; display:flex; align-items:center; justify-content:center; height:100vh; overflow:hidden;">
            <div style="position:absolute; width:100%; height:100%; animation:zoom 300s infinite linear;">
                <div style="position:absolute; top:20%; left:10%; font-size:4rem; opacity:0.4; animation:float 15s infinite;">🚀</div>
                <div style="position:absolute; top:60%; right:15%; font-size:3rem; opacity:0.4; animation:float 12s infinite;">🎈</div>
            </div>
            <div style="position:relative; z-index:10; background:rgba(255,255,255,0.9); padding:40px; border-radius:40px; max-width:80%; max-height:80vh; overflow-y:auto; box-shadow:0 20px 60px rgba(0,0,0,0.1); font-size:1.5rem; line-height:1.8;">
                <h1 style="color:#2E7D32; text-align:center;">${story.title}</h1>
                ${story.content.replace(/\n/g, '<br>')}
            </div>
            <style>
                @keyframes zoom { 0%, 100% { transform:scale(1); } 50% { transform:scale(1.1); } }
                @keyframes float { 0%, 100% { transform:translateY(0); } 50% { transform:translateY(-30px); } }
            </style>
        </body>
        </html>`;
        frame.src = URL.createObjectURL(new Blob([storyHtml], { type: 'text/html' }));
    }
}

// ৪. সাইডবার রেন্ডারিং (কালারফুল কিডস ফ্রেন্ডলি)
function renderSidebar(stories) {
    const list = document.getElementById('storyList');
    const colors = ['#FFD1DC', '#D1F2EB', '#FFF4BD', '#E1F5FE', '#F3E5F5', '#E8F5E9', '#FCE4EC', '#F1F8E9'];
    list.innerHTML = '';
    stories.forEach((s, index) => {
        const banner = document.createElement('div');
        banner.className = 'story-banner';
        banner.style.backgroundColor = colors[index % colors.length];
        banner.innerHTML = `<div>${s.title}</div>`;
        banner.onclick = () => { fetchAndPlay(s.id); document.getElementById('playerArea').scrollIntoView({behavior:'smooth'}); };
        list.appendChild(banner);
    });
}

async function loadStories() {
    const { data: stories } = await _supabase.from('stories').select('id, title, created_at').order('created_at', { ascending: true });
    if (stories) {
        const index = Math.floor(Date.now() / 86400000) % stories.length;
        dailyStoryId = stories[index].id;
        fetchAndPlay(dailyStoryId, true);
        renderSidebar(stories);
    }
}

document.addEventListener('DOMContentLoaded', initApp);
window.shareApp = async () => { /* Share logic */ };
