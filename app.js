// --- Supabase কনফিগারেশন ---
// সরাসরি আপনার প্রজেক্টের আসল তথ্য এখানে বসানো হয়েছে
const SUPABASE_URL = 'https://xptwwlrcygimfislsutz.supabase.co'; 
const SUPABASE_ANON_KEY = 'sb_publishable_N0YqY-tMEW_KWxFdS7zgVA_3CgR8Go-';

// ক্লায়েন্ট তৈরি
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let userStatus = 'free'; 
let deferredPrompt; 

// --- ১. পেমেন্ট ও ইউজার লজিক ---
window.initPayment = function() {
    window.location.href = "checkout.html"; 
};

function hidePremiumUI() {
    const elementsToHide = document.querySelectorAll('.premium-banner, .lock-overlay, .banner-lock-icon');
    elementsToHide.forEach(el => el.style.display = 'none');
}

// --- ২. PWA ইন্সটল লজিক ---
const installBtn = document.getElementById('installPwa');
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    if (installBtn) installBtn.classList.remove('hidden');
});

// --- ৩. অ্যাপ ইনিশিয়ালাইজেশন ---
async function initApp() {
    let uuid = localStorage.getItem('device_uuid') || self.crypto.randomUUID();
    localStorage.setItem('device_uuid', uuid);
    
    const footerUid = document.getElementById('footerUid');
    if (footerUid) footerUid.innerText = uuid;

    // ১. ডাটাবেস থেকে গল্পের সংখ্যা আনা
    const { count, error } = await _supabase.from('stories').select('*', { count: 'exact', head: true });
    const countDisplay = document.getElementById('totalCount');
    if (countDisplay) countDisplay.innerText = count || 0;

    // ২. ইউজার স্ট্যাটাস চেক
    const { data } = await _supabase.from('users').select('status').eq('device_uuid', uuid).maybeSingle();
    
    if (!data) {
        await _supabase.from('users').insert([{ device_uuid: uuid, status: 'free' }]);
    } else if (data.status === 'paid') {
        userStatus = 'paid';
        hidePremiumUI(); 
    }
    loadStories();
}

// --- ৪. গল্প লোড লজিক ---
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
        const content = story.story_content.replace(/\n/g, '<br>');
        const storyHtml = `<html><head><link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri&display=swap" rel="stylesheet"><style>body{font-family:'Hind Siliguri',sans-serif;padding:6%;line-height:1.8;background:#FDFBF7;color:#263238;font-size:1.4rem;user-select:none;}br{margin-bottom:15px;display:block;content:"";}</style></head><body oncontextmenu="return false;">${content}</body></html>`;
        const blob = new Blob([storyHtml], { type: 'text/html' });
        frame.src = URL.createObjectURL(blob);
    }
}

function renderSidebar(stories) {
    const sidebarList = document.getElementById('storyList');
    if (!sidebarList) return;
    sidebarList.innerHTML = '';
    stories.forEach(s => {
        const banner = document.createElement('div');
        banner.className = 'story-banner';
        banner.style.backgroundImage = `url('${s.thumbnail_url || 'assets/logo.svg'}')`;
        if (userStatus === 'free' && s.is_premium) banner.innerHTML = `<div class="banner-lock-icon">🔒</div>`;
        banner.onclick = () => { playStory(s); window.scrollTo({ top: 0, behavior: 'smooth' }); };
        sidebarList.appendChild(banner);
    });
}

document.addEventListener('DOMContentLoaded', initApp);
