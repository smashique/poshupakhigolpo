// --- Supabase Configuration ---
const SUPABASE_URL = 'https://your-project-id.supabase.co'; 
const SUPABASE_ANON_KEY = 'your-anon-key';
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- State Management ---
let currentStory = null;
let userStatus = 'free'; // ডিফল্ট স্ট্যাটাস

// --- 1. User Identification & Status Check ---
async function initUser() {
    let uuid = localStorage.getItem('device_uuid');
    if (!uuid) {
        uuid = self.crypto.randomUUID();
        localStorage.setItem('device_uuid', uuid);
        await _supabase.from('users').insert([{ device_uuid: uuid, status: 'free' }]);
    }
    
    // ডাটাবেস থেকে ইউজারের বর্তমান স্ট্যাটাস (free/paid) চেক করা
    const { data } = await _supabase.from('users').select('status').eq('device_uuid', uuid).maybeSingle();
    if (data) {
        userStatus = data.status;
        // যদি ইউজার পেইড হয়, তবে টপ প্রিমিয়াম ব্যানারটি হাইড করে দেওয়া
        if (userStatus === 'paid') {
            const banner = document.getElementById('premiumBanner');
            if (banner) banner.classList.add('hidden');
        }
    }
    return uuid;
}

// --- 2. Story Fetching Logic ---
async function loadStories() {
    const { data: allStories, error } = await _supabase.from('stories').select('*');

    if (error) {
        console.error('গল্প লোড করতে সমস্যা হয়েছে:', error);
        return;
    }

    if (allStories && allStories.length > 0) {
        // ডেইলি ফিক্সড স্টোরি লজিক
        const todaySeed = new Date().toISOString().split('T')[0].replace(/-/g, '');
        const dailyIndex = parseInt(todaySeed) % allStories.length;
        currentStory = allStories[dailyIndex];
        
        playStory(currentStory);
        renderSidebar(allStories);
    }
}

// --- 3. Iframe Player Logic ---
function playStory(story) {
    const frame = document.getElementById('storyFrame');
    const overlay = document.getElementById('lockOverlay');

    // প্রিমিয়াম লজিক: যদি গল্প প্রিমিয়াম হয় এবং ইউজার ফ্রি হয়
    if (story.is_premium && userStatus === 'free') {
        frame.src = "about:blank";
        overlay.classList.remove('hidden'); // লক ওভারলে দেখানো
    } else {
        overlay.classList.add('hidden');
        
        // WebApp HTML কোডকে Blob-এ রূপান্তর করে Iframe-এ লোড করা
        // এতে কোডটি আরও সিকিউর থাকে এবং ব্রাউজারে দ্রুত লোড হয়
        const blob = new Blob([story.webapp_html], { type: 'text/html' });
        const blobUrl = URL.createObjectURL(blob);
        frame.src = blobUrl;
    }
}

// --- 4. Sidebar Thumbnail Rendering ---
function renderSidebar(stories) {
    const sidebarList = document.getElementById('storyList');
    sidebarList.innerHTML = '';

    // গল্পের তালিকা থাম্বনেইল আকারে দেখানো
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

// --- 5. Controls & Protection ---
function toggleFullscreen() {
    const elem = document.getElementById('storyFrame');
    if (!document.fullscreenElement) {
        elem.requestFullscreen().catch(err => alert(`Error: ${err.message}`));
    } else {
        document.exitFullscreen();
    }
}

// কন্টেন্ট প্রোটেকশন: রাইট ক্লিক এবং কপি ডিজেবল
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && (e.key === 'c' || e.key === 'u' || e.key === 's' || e.key === 'p')) {
        e.preventDefault();
        return false;
    }
});

// --- 6. Payment Logic ---
async function initPayment() {
    alert('আপনাকে পেমেন্ট গেটওয়েতে নিয়ে যাওয়া হচ্ছে... (UddoktaPay)');
    // এখানে আপনার পেমেন্ট গেটওয়ে বা চেকআউট পেজের লিঙ্ক হবে
    // window.location.href = "/checkout"; 
}

// --- PWA Service Worker ---
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(err => console.log('SW Failed', err));
    });
}

// --- Initialize App ---
document.addEventListener('DOMContentLoaded', async () => {
    await initUser();
    await loadStories();
});
