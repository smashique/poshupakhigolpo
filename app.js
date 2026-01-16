const SUPABASE_URL = 'https://xptwwlrcygimfislsutz.supabase.co'.trim(); 
const SUPABASE_ANON_KEY = 'sb_publishable_N0YqY-tMEW_KWxFdS7zgVA_3CgR8Go-'.trim();
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let userStatus = 'free'; 
let dailyStoryId = null;

// ১. অ্যাপ শুরু এবং ইউজার চেক
async function initApp() {
    let uuid = localStorage.getItem('device_uuid') || self.crypto.randomUUID();
    localStorage.setItem('device_uuid', uuid);
    if(document.getElementById('footerUid')) document.getElementById('footerUid').innerText = uuid;

    try {
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

// ৩. গল্প প্রদর্শন
function playStory(story, isDailyFree = false) {
    const frame = document.getElementById('storyFrame');
    const overlay = document.getElementById('lockOverlay');
    
    if (userStatus === 'paid' || isDailyFree || story.id === dailyStoryId) {
        overlay.classList.add('hidden');
        const storyHtml = `<html><head><style>body{font-family:sans-serif;padding:8%;line-height:1.8;font-size:1.6rem;text-align:justify;background:#FDFBF7;}</style></head><body>${story.content.replace(/\n/g, '<br>')}</body></html>`;
        frame.src = URL.createObjectURL(new Blob([storyHtml], { type: 'text/html' }));
    } else {
        frame.src = "about:blank";
        overlay.classList.remove('hidden');
    }
}

// ৪. সাইডবার রেন্ডারিং
function renderSidebar(stories) {
    const list = document.getElementById('storyList');
    list.innerHTML = '';
    stories.forEach(s => {
        const banner = document.createElement('div');
        banner.className = 'story-banner';
        banner.style.backgroundImage = `url('${s.thumbnail_url || 'assets/logo.svg'}')`;
        const lock = (userStatus === 'free' && s.id !== dailyStoryId) ? '🔒 ' : '';
        banner.innerHTML = `<div style="background:rgba(0,0,0,0.6);color:white;padding:8px;width:100%;font-size:0.9rem;">${lock}${s.title}</div>`;
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

window.initPayment = () => window.location.href = "checkout.html";
document.addEventListener('DOMContentLoaded', initApp);
