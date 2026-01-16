// --- ১. Supabase কনফিগারেশন ---
const SUPABASE_URL = 'https://xptwwlrcygimfislsutz.supabase.co'.trim(); 
const SUPABASE_ANON_KEY = 'sb_publishable_N0YqY-tMEW_KWxFdS7zgVA_3CgR8Go-'.trim();
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let userStatus = 'free'; 

// --- ২. ফুল-স্ক্রিন লজিক ---
document.getElementById('fullscreenBtn').addEventListener('click', () => {
    const playerArea = document.getElementById('playerArea');
    if (!document.fullscreenElement) {
        if (playerArea.requestFullscreen) {
            playerArea.requestFullscreen();
        } else if (playerArea.webkitRequestFullscreen) {
            playerArea.webkitRequestFullscreen();
        }
        document.getElementById('fullscreenBtn').innerText = "❌ ছোট করো";
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
        document.getElementById('fullscreenBtn').innerText = "📺 বড় পর্দায় পড়ো";
    }
});

// --- ৩. পেমেন্ট লজিক ---
window.initPayment = function() {
    console.log("পেমেন্ট গেটওয়েতে পাঠানো হচ্ছে...");
    window.location.href = "checkout.html"; 
};

function hidePremiumUI() {
    const elementsToHide = document.querySelectorAll('.premium-banner, .lock-overlay');
    elementsToHide.forEach(el => el.style.display = 'none');
}

// --- ৪. অ্যাপ ইনিশিয়ালাইজেশন ---
async function initApp() {
    let uuid = localStorage.getItem('device_uuid') || self.crypto.randomUUID();
    localStorage.setItem('device_uuid', uuid);
    if(document.getElementById('footerUid')) document.getElementById('footerUid').innerText = uuid;

    try {
        const { count, error: countError } = await _supabase.from('stories').select('*', { count: 'exact', head: true });
        if (countError) throw countError;
        if(document.getElementById('totalCount')) document.getElementById('totalCount').innerText = count || 0;

        const { data: user } = await _supabase.from('users').select('status').eq('device_uuid', uuid).maybeSingle();
        if (!user) {
            await _supabase.from('users').insert([{ device_uuid: uuid, status: 'free' }]);
        } else if (user.status === 'paid') {
            userStatus = 'paid';
            hidePremiumUI();
        }

        loadStories();
    } catch (err) {
        console.error("ইনিট এরর:", err.message);
    }
}

async function loadStories() {
    const { data: stories, error } = await _supabase.from('stories').select('*');
    if (error) return;

    if (stories && stories.length > 0) {
        playStory(stories[0]); 
        renderSidebar(stories);
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
        const content = story.content || "কোনো গল্প পাওয়া যায়নি।";
        // আইফ্রেমের ভেতরের লেখার সাইজ বড় করার জন্য CSS যুক্ত করা হয়েছে
        const storyHtml = `<html><head><link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri&display=swap" rel="stylesheet"><style>body{font-family:'Hind Siliguri',sans-serif;padding:8% 6%;line-height:1.8;background:#FDFBF7;color:#263238;font-size:1.6rem; text-align:justify;}</style></head><body>${content.replace(/\n/g, '<br>')}</body></html>`;
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
        banner.innerHTML = `<div style="background:rgba(0,0,0,0.6);color:white;padding:8px;width:100%;font-size:0.9rem;">${s.title}</div>`;
        banner.onclick = () => { playStory(s); window.scrollTo({ top: 0, behavior: 'smooth' }); };
        sidebarList.appendChild(banner);
    });
}

document.addEventListener('DOMContentLoaded', initApp);
