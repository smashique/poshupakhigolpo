// --- Supabase Configuration ---
// আপনার .env ফাইল থেকে প্রাপ্ত তথ্য এখানে বসান
const SUPABASE_URL = 'https://your-project-id.supabase.co'; 
const SUPABASE_ANON_KEY = 'your-anon-key';
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- State Management ---
let currentStory = null;
let currentLang = 'bn'; // ডিফল্ট ভাষা বাংলা

// --- 1. User Identification (UUID) ---
function initUser() {
    let uuid = localStorage.getItem('device_uuid');
    if (!uuid) {
        uuid = self.crypto.randomUUID();
        localStorage.setItem('device_uuid', uuid);
        // নতুন ইউজার হিসেবে সুপাবেসে রেজিস্টার করা
        _supabase.from('users').insert([{ device_uuid: uuid, status: 'free' }]).then();
    }
    return uuid;
}

// --- 2. Story Fetching Logic ---
async function loadStories() {
    // সব গল্প ফেচ করা
    const { data: allStories, error } = await _supabase.from('stories').select('*');

    if (error) {
        console.error('গল্প লোড করতে সমস্যা হয়েছে:', error);
        return;
    }

    if (allStories && allStories.length > 0) {
        // A. ডেইলি ফিক্সড স্টোরি (তারিখ অনুযায়ী সবার জন্য এক)
        const todaySeed = new Date().toISOString().split('T')[0].replace(/-/g, '');
        const dailyIndex = parseInt(todaySeed) % allStories.length;
        currentStory = allStories[dailyIndex];
        renderMainStory(currentStory);

        // B. সাইডবার র‍্যান্ডমনেস (১০টি গল্প)
        const shuffled = [...allStories].sort(() => 0.5 - Math.random());
        renderSidebar(shuffled.slice(0, 10));
    }
}

// --- 3. UI Rendering ---
function renderMainStory(story) {
    const titleEl = document.getElementById('storyTitle');
    const bodyEl = document.getElementById('storyBody');

    titleEl.innerText = currentLang === 'bn' ? story.title_bn : story.title_en;
    bodyEl.innerText = currentLang === 'bn' ? story.content_bn : story.content_en;

    // যদি প্রিমিয়াম হয় তবে চেক করা
    if (story.is_premium) {
        checkAccess();
    }
}

function renderSidebar(stories) {
    const sidebarList = document.getElementById('storyList');
    sidebarList.innerHTML = '';

    stories.forEach(s => {
        const item = document.createElement('div');
        item.className = 'story-item';
        item.innerHTML = `
            <span>${currentLang === 'bn' ? s.title_bn : s.title_en}</span>
            ${s.is_premium ? '<span class="lock-icon">🔒</span>' : ''}
        `;
        item.onclick = () => {
            currentStory = s;
            renderMainStory(s);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        };
        sidebarList.appendChild(item);
    });
}

// --- 4. Controls & Toggles ---
function toggleLang(lang) {
    currentLang = lang;
    document.getElementById('btnBn').classList.toggle('active', lang === 'bn');
    document.getElementById('btnEn').classList.toggle('active', lang === 'en');
    
    if (currentStory) {
        renderMainStory(currentStory);
        // সাইডবার রিফ্রেশ করার জন্য আবার লোড করা যেতে পারে
    }
}

function toggleFullscreen() {
    const elem = document.getElementById('contentArea');
    if (!document.fullscreenElement) {
        elem.requestFullscreen().catch(err => {
            alert(`Error: ${err.message}`);
        });
    } else {
        document.exitFullscreen();
    }
}

// --- 5. Content Protection (Anti-Copy) ---
document.addEventListener('keydown', (e) => {
    // Ctrl+C, Ctrl+U, Ctrl+S ডিজেবল করা
    if (e.ctrlKey && (e.key === 'c' || e.key === 'u' || e.key === 's' || e.key === 'p')) {
        e.preventDefault();
        return false;
    }
});

// --- 6. Payment Initialization (UddoktaPay) ---
async function initPayment() {
    const deviceId = localStorage.getItem('device_uuid');
    
    // এখানে আপনার ভার্সেল এপিআই এন্ডপয়েন্টে রিকোয়েস্ট যাবে
    alert('পেমেন্ট গেটওয়েতে পাঠানো হচ্ছে... (UddoktaPay Integration)');
    
    // স্যাম্পল লজিক:
    // fetch('/api/create-payment', { method: 'POST', body: JSON.stringify({ deviceId }) })
    // .then(res => res.json())
    // .then(data => window.location.href = data.payment_url);
}

// --- PWA Service Worker Registration ---
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(reg => console.log('SW Registered'))
            .catch(err => console.log('SW Registration Failed', err));
    });
}

// --- Initialize App ---
document.addEventListener('DOMContentLoaded', () => {
    initUser();
    loadStories();
});
