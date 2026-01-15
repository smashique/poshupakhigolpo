// --- Supabase Configuration ---
const SUPABASE_URL = 'https://your-project-id.supabase.co'; 
const SUPABASE_ANON_KEY = 'your-anon-key';
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- State Management ---
let currentStory = null;
let userStatus = 'free'; 
let deferredPrompt; 

// --- ১. ইউজার স্ট্যাটাস এবং ব্যানার কন্ট্রোল ---
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
        if (banner) banner.style.display = 'none'; // পেইড ইউজারদের জন্য ব্যানার হাইড
    }
}

// --- ২. PWA ইন্সটল বাটন ফিক্স (Global Logic) ---
const installBtn = document.getElementById('installPwa');

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    console.log("PWA ইন্সটল প্রম্পট ফায়ার হয়েছে।");
    if (installBtn) {
        installBtn.classList.remove('hidden'); // CSS এর hidden ক্লাস সরাবে
        installBtn.style.display = 'block';    // সরাসরি বাটনটি দেখাবে
    }
});

if (installBtn) {
    installBtn.onclick = async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') {
                installBtn.style.display = 'none';
            }
            deferredPrompt = null;
        }
    };
}

// --- ৩. পেমেন্ট রিডাইরেক্ট (window অবজেক্টে রাখা হয়েছে) ---
// এটি করলে HTML এর onclick="initPayment()" এটি সরাসরি খুঁজে পাবে
window.initPayment = function() {
    console.log("চেকআউট পেজে পাঠানো হচ্ছে...");
    window.location.href = "checkout.html"; 
};

// --- ৪. গল্প লোড এবং আইফ্রেম কন্ট্রোল ---
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
        overlay.classList.remove('hidden'); // লক দেখাবে
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
        banner.onclick = () => { 
            playStory(s); 
            window.scrollTo({ top: 0, behavior: 'smooth' }); 
        };
        sidebarList.appendChild(banner);
    });
}

// --- ৫. রিফ্রেশ বাটন লজিক ---
const refreshBtn = document.getElementById('refreshStories');
if (refreshBtn) {
    refreshBtn.onclick = () => loadStories(true);
}

// --- ইনিশিয়ালাইজেশন ---
document.addEventListener('DOMContentLoaded', async () => {
    await initUser();
    await loadStories();
});

// সার্ভিস ওয়ার্কার রেজিস্ট্রেশন
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(err => console.log('SW Error:', err));
}
