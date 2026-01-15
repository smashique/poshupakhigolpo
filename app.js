// --- Supabase Configuration ---
const SUPABASE_URL = 'https://your-project-id.supabase.co'; 
const SUPABASE_ANON_KEY = 'your-anon-key';
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- State Management ---
let currentStory = null;
let userStatus = 'free'; 
let deferredPrompt; 

// --- ১. পেমেন্ট রিডাইরেক্ট (গ্লোবাল ফিক্স) ---
// এটি window অবজেক্টে রাখা হয়েছে যেন HTML সরাসরি খুঁজে পায়
window.initPayment = function() {
    console.log("চেকআউট পেজে পাঠানো হচ্ছে...");
    window.location.href = "checkout.html"; 
};

// --- ২. PWA ইন্সটল লজিক (Force Visibility) ---
const installBtn = document.getElementById('installPwa');

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    console.log("PWA ইন্সটল করার সুযোগ পাওয়া গেছে।");
    if (installBtn) {
        installBtn.classList.remove('hidden'); // hidden ক্লাস সরাবে
        installBtn.style.display = 'inline-block'; // সরাসরি শো করবে
    }
});

if (installBtn) {
    installBtn.onclick = async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') installBtn.style.display = 'none';
            deferredPrompt = null;
        }
    };
}

// --- ৩. ইউজার এবং গল্প লোড লজিক ---
async function initUser() {
    let uuid = localStorage.getItem('device_uuid');
    if (!uuid) {
        uuid = self.crypto.randomUUID();
        localStorage.setItem('device_uuid', uuid);
        await _supabase.from('users').insert([{ device_uuid: uuid, status: 'free' }]);
    }
    const { data } = await _supabase.from('users').select('status').eq('device_uuid', uuid).maybeSingle();
    if (data && data.status === 'paid') {
        userStatus = 'paid';
        const banner = document.getElementById('premiumBanner');
        if (banner) banner.style.display = 'none';
    }
}

async function loadStories(isRefresh = false) {
    const { data: allStories } = await _supabase.from('stories').select('*');
    if (allStories && allStories.length > 0) {
        if (!isRefresh) {
            const todaySeed = new Date().toISOString().split('T')[0].replace(/-/g, '');
            const dailyIndex = parseInt(todaySeed) % allStories.length;
            playStory(allStories[dailyIndex]);
        }
        const shuffled = [...allStories].sort(() => 0.5 - Math.random()).slice(0, 10);
        renderSidebar(shuffled);
    }
}

function playStory(story) {
    const frame = document.getElementById('storyFrame');
    const overlay = document.getElementById('lockOverlay');
    if (story.is_premium && userStatus === 'free') {
        frame.src = "about:blank";
        overlay.classList.remove('hidden');
    } else {
        overlay.classList.add('hidden');
        const blob = new Blob([story.webapp_html], { type: 'text/html' });
        frame.src = URL.createObjectURL(blob);
    }
}

function renderSidebar(stories) {
    const sidebarList = document.getElementById('storyList');
    sidebarList.innerHTML = '';
    stories.forEach(s => {
        const banner = document.createElement('div');
        banner.className = 'story-banner';
        banner.style.backgroundImage = `url('${s.thumbnail_url}')`;
        if (userStatus === 'free' && s.is_premium) {
            banner.innerHTML = `<div class="banner-lock-icon">🔒</div>`;
        }
        banner.onclick = () => { playStory(s); window.scrollTo({ top: 0, behavior: 'smooth' }); };
        sidebarList.appendChild(banner);
    });
}

// --- ৪. রিফ্রেশ এবং প্রটেকশন ---
const refreshBtn = document.getElementById('refreshStories');
if (refreshBtn) refreshBtn.onclick = () => loadStories(true);

document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && ['c', 'u', 's', 'p'].includes(e.key)) e.preventDefault();
});

// --- ৫. ইনিশিয়ালাইজেশন ---
document.addEventListener('DOMContentLoaded', async () => {
    await initUser();
    await loadStories();
});

// Service Worker Registration
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(err => console.log('SW Registration Failed', err));
}
