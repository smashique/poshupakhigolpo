// --- Supabase কনফিগারেশন ---
const SUPABASE_URL = 'https://your-project-id.supabase.co'; 
const SUPABASE_ANON_KEY = 'your-anon-key';
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let userStatus = 'free'; 
let deferredPrompt; 

// --- ১. পেমেন্ট ও ইউজার লজিক ---
window.initPayment = function() {
    console.log("চেকআউট পেজে পাঠানো হচ্ছে...");
    window.location.href = "checkout.html"; 
};

/**
 * প্রিমিয়াম ইউজারদের জন্য UI পরিষ্কার করা (Neuro-UX)
 */
function hidePremiumUI() {
    const elementsToHide = document.querySelectorAll('.premium-banner, .lock-overlay, .banner-lock-icon');
    elementsToHide.forEach(el => el.style.display = 'none');
}

// --- ২. PWA ইন্সটল লজিক (FOMO ট্রিগার) ---
const installBtn = document.getElementById('installPwa');

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    if (installBtn) {
        installBtn.classList.remove('hidden');
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

// --- ৩. অ্যাপ ইনিশিয়ালাইজেশন ---
async function initApp() {
    // ইউজার শনাক্তকরণ ও আইডি প্রদর্শন
    let uuid = localStorage.getItem('device_uuid') || self.crypto.randomUUID();
    localStorage.setItem('device_uuid', uuid);
    
    const uidElement = document.getElementById('uidDisplay');
    if (uidElement) uidElement.innerText = `ইউনিক আইডি: ${uuid}`;

    // ১. স্টোরিব্যাংক থেকে মোট গল্পের সংখ্যা দেখানো (Social Proof)
    const { count } = await _supabase.from('stories').select('*', { count: 'exact', head: true });
    const countDisplay = document.getElementById('totalCount');
    if (countDisplay) countDisplay.innerText = count || 0;

    // ২. ইউজার স্ট্যাটাস চেক
    const { data } = await _supabase.from('users').select('status').eq('device_uuid', uuid).maybeSingle();
    
    // নতুন ইউজার হলে ডাটাবেসে এন্ট্রি করা
    if (!data) {
        await _supabase.from('users').insert([{ device_uuid: uuid, status: 'free' }]);
    } else if (data.status === 'paid') {
        userStatus = 'paid';
        hidePremiumUI(); // পেমেন্ট করা থাকলে ব্যানার সরিয়ে ফেলা
    }

    loadStories();
}

// --- ৪. গল্প লোড ও প্রদর্শন লজিক ---
async function loadStories(isRefresh = false) {
    const { data: allStories } = await _supabase.from('stories').select('*');
    if (allStories && allStories.length > 0) {
        // প্রতিদিনের ফ্রি গল্প লজিক (Daily Habit Loop)
        if (!isRefresh) {
            const todaySeed = new Date().toISOString().split('T')[0].replace(/-/g, '');
            const dailyIndex = parseInt(todaySeed) % allStories.length;
            playStory(allStories[dailyIndex]);
        }
        
        // সাইডবারে ১০টি র‍্যান্ডম গল্প দেখানো
        const shuffled = [...allStories].sort(() => 0.5 - Math.random()).slice(0, 10);
        renderSidebar(shuffled);
    }
}

/**
 * দ্বিভাষিক গল্প রেন্ডার করা (Bilingual Rendering)
 */
function playStory(story) {
    const frame = document.getElementById('storyFrame');
    const overlay = document.getElementById('lockOverlay');
    
    // প্রিমিয়াম লক চেক
    if (story.is_premium && userStatus === 'free') {
        frame.src = "about:blank";
        overlay.classList.remove('hidden');
    } else {
        overlay.classList.add('hidden');
        
        // টেক্সট ফরম্যাটিং: নিউলাইনকে HTML ব্রেকে রূপান্তর
        const content = story.story_content.replace(/\n/g, '<br>');
        
        // আইফ্রেমের জন্য কাস্টম ডিজাইন্ড টেমপ্লেট (Expert Layout)
        const storyHtml = `
            <html>
                <head>
                    <link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri&display=swap" rel="stylesheet">
                    <style>
                        body { 
                            font-family: 'Hind Siliguri', sans-serif; 
                            padding: 6%; 
                            line-height: 1.8; 
                            background: #FDFBF7; 
                            color: #263238; 
                            font-size: 1.4rem; 
                            user-select: none;
                        }
                        br { margin-bottom: 15px; display: block; content: ""; }
                    </style>
                </head>
                <body oncontextmenu="return false;">
                    ${content}
                </body>
            </html>`;
            
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
        
        // লক আইকন প্রদর্শন লজিক
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

// --- ৫. ফুলস্ক্রিন ও ইন্টারঅ্যাকশন ---
const fsBtn = document.getElementById('fullscreenBtn');
if (fsBtn) {
    fsBtn.onclick = () => {
        const elem = document.getElementById('playerArea');
        if (elem.requestFullscreen) elem.requestFullscreen();
        else if (elem.webkitRequestFullscreen) elem.webkitRequestFullscreen();
        else if (elem.msRequestFullscreen) elem.msRequestFullscreen();
    };
}

const refreshBtn = document.getElementById('refreshStories');
if (refreshBtn) refreshBtn.onclick = () => loadStories(true);

document.addEventListener('DOMContentLoaded', initApp);

// Service Worker রেজিস্ট্রেশন
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(err => console.log('SW Registration Failed', err));
}
