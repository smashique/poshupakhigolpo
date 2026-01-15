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
 * ইউজার কিনে ফেললে প্রিমিয়াম ব্যানার ও লকগুলো লুকিয়ে ফেলা হয়
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
        installBtn.classList.remove('hidden'); // FOMO বাটনটি দেখাবে
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
    // ইউজার শনাক্তকরণ
    let uuid = localStorage.getItem('device_uuid') || self.crypto.randomUUID();
    localStorage.setItem('device_uuid', uuid);
    
    // ইউনিক আইডি প্রদর্শন (মাঝখানে এবং একদম নিচে ফুটারে)
    const uidDisplay = document.getElementById('uidDisplay');
    const footerUid = document.getElementById('footerUid');
    if (uidDisplay) uidDisplay.innerText = `আইডি: ${uuid}`;
    if (footerUid) footerUid.innerText = uuid;

    // ১. স্টোরিব্যাংক থেকে মোট গল্পের সংখ্যা দেখানো (Social Proof)
    const { count } = await _supabase.from('stories').select('*', { count: 'exact', head: true });
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

// --- ৪. গল্প লোড ও প্রদর্শন লজিক ---
async function loadStories(isRefresh = false) {
    const { data: allStories } = await _supabase.from('stories').select('*');
    if (allStories && allStories.length > 0) {
        if (!isRefresh) {
            // প্রতিদিনের নতুন ফ্রি গল্প লজিক
            const todaySeed = new Date().toISOString().split('T')[0].replace(/-/g, '');
            const dailyIndex = parseInt(todaySeed) % allStories.length;
            playStory(allStories[dailyIndex]);
        }
        
        // সাইডবারে ১০টি র‍্যান্ডম গল্প
        const shuffled = [...allStories].sort(() => 0.5 - Math.random()).slice(0, 10);
        renderSidebar(shuffled);
    }
}

/**
 * দ্বিভাষিক গল্প রেন্ডার করা (Bilingual Rendering)
 * বাংলা ও ইংরেজি কন্টেন্টকে আইফ্রেমের জন্য ফরম্যাট করা হয়
 */
function playStory(story) {
    const frame = document.getElementById('storyFrame');
    const overlay = document.getElementById('lockOverlay');
    
    if (story.is_premium && userStatus === 'free') {
        frame.src = "about:blank";
        overlay.classList.remove('hidden');
    } else {
        overlay.classList.add('hidden');
        const content = story.story_content.replace(/\n/g, '<br>');
        
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

// --- ৫. ফুলস্ক্রিন ও ইন্টারঅ্যাকশন (Fixed Logic) ---
const fsBtn = document.getElementById('fullscreenBtn');
if (fsBtn) {
    fsBtn.onclick = () => {
        const elem = document.getElementById('playerArea'); // পুরো কন্টেইনার ফুলস্ক্রিন করা হচ্ছে
        if (elem.requestFullscreen) {
            elem.requestFullscreen();
        } else if (elem.webkitRequestFullscreen) { /* Safari/iOS */
            elem.webkitRequestFullscreen();
        } else if (elem.msRequestFullscreen) { /* IE11 */
            elem.msRequestFullscreen();
        }
    };
}

const refreshBtn = document.getElementById('refreshStories');
if (refreshBtn) refreshBtn.onclick = () => loadStories(true);

document.addEventListener('DOMContentLoaded', initApp);

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(err => console.log('SW Registration Failed', err));
}
