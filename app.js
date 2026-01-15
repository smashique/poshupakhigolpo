// --- Supabase Configuration ---
const SUPABASE_URL = 'https://your-project-id.supabase.co'; 
const SUPABASE_ANON_KEY = 'your-anon-key';
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- State Management ---
let currentStory = null;
let userStatus = 'free'; // ডিফল্ট স্ট্যাটাস 'free'
let deferredPrompt; // PWA ইন্সটলেশন প্রম্পট স্টোর করার জন্য

// --- 1. User Identification & Status Check ---
async function initUser() {
    let uuid = localStorage.getItem('device_uuid');
    
    // নতুন ইউজারের জন্য UUID তৈরি এবং ডাটাবেসে সেভ
    if (!uuid) {
        uuid = self.crypto.randomUUID();
        localStorage.setItem('device_uuid', uuid);
        await _supabase.from('users').insert([{ device_uuid: uuid, status: 'free' }]);
    }
    
    // ডাটাবেস থেকে ইউজারের বর্তমান স্ট্যাটাস (free/paid) চেক করা
    const { data } = await _supabase.from('users').select('status').eq('device_uuid', uuid).maybeSingle();
    
    if (data) {
        userStatus = data.status;
        // যদি ইউজার পেইড (Paid) হয়, তবে টপ প্রিমিয়াম ব্যানারটি হাইড করা
        if (userStatus === 'paid') {
            const banner = document.getElementById('premiumBanner');
            if (banner) banner.classList.add('hidden');
        }
    }
    return uuid;
}

// --- 2. Story Fetching & Sidebar Randomness ---
async function loadStories(isRefresh = false) {
    const { data: allStories, error } = await _supabase.from('stories').select('*');

    if (error) {
        console.error('গল্প লোড করতে সমস্যা হয়েছে:', error);
        return;
    }

    if (allStories && allStories.length > 0) {
        // প্রথমবার লোড হলে ডেইলি ফিক্সড স্টোরি দেখানো (সবার জন্য এক)
        if (!isRefresh) {
            const todaySeed = new Date().toISOString().split('T')[0].replace(/-/g, '');
            const dailyIndex = parseInt(todaySeed) % allStories.length;
            currentStory = allStories[dailyIndex];
            playStory(currentStory);
        }

        // র‍্যান্ডম ১০টি গল্প সাইডবারে (Variable Reward - নিউরোমার্কেটিং)
        const shuffled = [...allStories].sort(() => 0.5 - Math.random()).slice(0, 10);
        renderSidebar(shuffled);
    }
}

// --- 3. Iframe Player & Blob Injection ---
function playStory(story) {
    const frame = document.getElementById('storyFrame');
    const overlay = document.getElementById('lockOverlay');

    // প্রিমিয়াম লজিক: যদি গল্প প্রিমিয়াম হয় এবং ইউজার ফ্রি হয়
    if (story.is_premium && userStatus === 'free') {
        frame.src = "about:blank"; // কন্টেন্ট হাইড
        overlay.classList.remove('hidden'); // লক ওভারলে দেখানো
    } else {
        overlay.classList.add('hidden');
        
        // WebApp HTML কোডকে Blob-এ রূপান্তর করে Iframe-এ লোড করা (সিকিউর ইনজেকশন)
        const blob = new Blob([story.webapp_html], { type: 'text/html' });
        const blobUrl = URL.createObjectURL(blob);
        frame.src = blobUrl;
    }
}

// --- 4. Sidebar Thumbnail Rendering ---
function renderSidebar(stories) {
    const sidebarList = document.getElementById('storyList');
    sidebarList.innerHTML = '';

    stories.forEach(s => {
        const banner = document.createElement('div');
        banner.className = 'story-banner';
        banner.style.backgroundImage = `url('${s.thumbnail_url}')`;
        
        // ফ্রি ইউজারদের জন্য প্রিমিয়াম থাম্বনেইলে লক আইকন
        if (userStatus === 'free' && s.is_premium) {
            banner.innerHTML = `<div class="banner-lock-icon">🔒</div>`;
        }

        banner.onclick = () => {
            currentStory = s;
            playStory(s);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        };
        sidebarList.appendChild(banner);
    });
}

// --- 5. PWA Installation Logic ---
const installBtn = document.getElementById('installPwa');

window.addEventListener('beforeinstallprompt', (e) => {
    // ব্রাউজারের ডিফল্ট প্রম্পট আটকে দেওয়া
    e.preventDefault();
    deferredPrompt = e;
    // আমাদের কাস্টম ইন্সটল বাটনটি দেখানো
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

// --- 6. Controls & Protection ---
function toggleFullscreen() {
    const elem = document.getElementById('storyFrame');
    if (!document.fullscreenElement) {
        elem.requestFullscreen().catch(err => alert(`Error: ${err.message}`));
    } else {
        document.exitFullscreen();
    }
}

// কন্টেন্ট প্রোটেকশন: রাইট ক্লিক এবং কিবোর্ড কপি ডিজেবল
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && (e.key === 'c' || e.key === 'u' || e.key === 's' || e.key === 'p')) {
        e.preventDefault();
        return false;
    }
});

// --- 7. Payment Logic (Redirect to Checkout) ---
async function initPayment() {
    // নিউরোমার্কেটিং: সরাসরি ফোকাসড চেকআউট পেজে পাঠানো
    window.location.href = "checkout.html"; 
}

// --- 8. Refresh Sidebar Trigger ---
const refreshBtn = document.getElementById('refreshStories');
if (refreshBtn) {
    refreshBtn.onclick = () => loadStories(true);
}

// --- Initialize App ---
document.addEventListener('DOMContentLoaded', async () => {
    await initUser();
    await loadStories();
});

// Service Worker Registration for PWA Support
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(err => console.log('SW Failed', err));
    });
}
