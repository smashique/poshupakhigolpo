// --- Supabase কনফিগারেশন ---
// আপনার ড্যাশবোর্ড থেকে পাওয়া আসল তথ্য সরাসরি এখানে দেওয়া হয়েছে
const SUPABASE_URL = 'https://xptwwlrcygimfislsutz.supabase.co'; 
const SUPABASE_ANON_KEY = 'sb_publishable_N0YqY-tMEW_KWxFdS7zgVA_3CgR8Go-';

// সুপাবেস ক্লায়েন্ট তৈরি
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let userStatus = 'free'; 
let deferredPrompt; 

// --- ১. পেমেন্ট ও ইউজার লজিক ---
window.initPayment = function() {
    console.log("পেমেন্ট গেটওয়েতে পাঠানো হচ্ছে...");
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
    console.log("PWA ইন্সটল করার সুযোগ পাওয়া গেছে।");
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

// --- ৩. অ্যাপ ইনিশিয়ালাইজেশন ---
async function initApp() {
    // ইউনিক আইডি তৈরি ও সংরক্ষণ
    let uuid = localStorage.getItem('device_uuid') || self.crypto.randomUUID();
    localStorage.setItem('device_uuid', uuid);
    
    const footerUid = document.getElementById('footerUid');
    if (footerUid) footerUid.innerText = uuid;

    try {
        // ১. ডাটাবেস থেকে গল্পের মোট সংখ্যা আনা
        const { count, error: countError } = await _supabase.from('stories').select('*', { count: 'exact', head: true });
        
        if (countError) throw countError;

        const countDisplay = document.getElementById('totalCount');
        if (countDisplay) countDisplay.innerText = count || 0;

        // ২. ইউজার স্ট্যাটাস চেক
        const { data, error: userError } = await _supabase.from('users').select('status').eq('device_uuid', uuid).maybeSingle();
        
        if (userError) throw userError;

        if (!data) {
            // নতুন ইউজার হলে ডাটাবেসে এন্ট্রি করা
            await _supabase.from('users').insert([{ device_uuid: uuid, status: 'free' }]);
        } else if (data.status === 'paid') {
            userStatus = 'paid';
            hidePremiumUI(); 
        }
    } catch (err) {
        console.error("সুপাবেস কানেকশন এরর:", err.message);
    }

    loadStories();
}

// --- ৪. গল্প লোড ও প্রদর্শন লজিক ---
async function loadStories(isRefresh = false) {
    try {
        const { data: allStories, error } = await _supabase.from('stories').select('*');
        
        if (error) throw error;

        if (allStories && allStories.length > 0) {
            if (!isRefresh) {
                // প্রতিদিনের একটি নির্দিষ্ট গল্প সেট করা
                const todaySeed = new Date().toISOString().split('T')[0].replace(/-/g, '');
                const dailyIndex = parseInt(todaySeed) % allStories.length;
                playStory(allStories[dailyIndex]);
            }
            // সাইডবারে ১০টি র‍্যান্ডম গল্প দেখানো
            const shuffled = [...allStories].sort(() => 0.5 - Math.random()).slice(0, 10);
            renderSidebar(shuffled);
        }
    } catch (err) {
        console.error("গল্প লোড করতে সমস্যা হয়েছে:", err.message);
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

// --- ৫. বাটন কন্ট্রোল ---
const refreshBtn = document.getElementById('refreshStories');
if (refreshBtn) refreshBtn.onclick = () => loadStories(true);

const fsBtn = document.getElementById('fullscreenBtn');
if (fsBtn) {
    fsBtn.onclick = () => {
        const elem = document.getElementById('playerArea');
        if (elem.requestFullscreen) elem.requestFullscreen();
        else if (elem.webkitRequestFullscreen) elem.webkitRequestFullscreen();
    };
}

document.addEventListener('DOMContentLoaded', initApp);
