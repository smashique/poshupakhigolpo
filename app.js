// --- ১. Supabase কনফিগারেশন ---
const SUPABASE_URL = 'https://xptwwlrcygimfislsutz.supabase.co'.trim(); 
const SUPABASE_ANON_KEY = 'sb_publishable_N0YqY-tMEW_KWxFdS7zgVA_3CgR8Go-'.trim();
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let userStatus = 'free'; 
let dailyStoryId = null; // আজকের ফ্রি গল্পের আইডি রাখার জন্য

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
        document.getElementById('fullscreenBtn').innerText = "📺 বড় পর্দায় পড়ো";
    }
});

// --- ৩. পেমেন্ট লজিক ---
window.initPayment = function() {
    console.log("পেমেন্ট গেটওয়েতে পাঠানো হচ্ছে...");
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
        // গল্পের মোট সংখ্যা দেখানো
        const { count, error: countError } = await _supabase.from('stories').select('*', { count: 'exact', head: true });
        if (countError) throw countError;
        if(document.getElementById('totalCount')) document.getElementById('totalCount').innerText = count || 0;

        // ইউজারের বর্তমান স্ট্যাটাস চেক করা
        const { data: user } = await _supabase.from('users').select('status').eq('device_uuid', uuid).maybeSingle();
        if (!user) {
            await _supabase.from('users').insert([{ device_uuid: uuid, status: 'free' }]);
        } else if (user.status === 'paid') {
            userStatus = 'paid';
            hidePremiumUI();
        }

        loadStories();
    } catch (err) {
        console.error("ইনিট এরর:", err.message); //
    }
}

// --- ৫. ডেইলি অটো-সিলেকশন লজিক ---
async function loadStories() {
    const { data: stories, error } = await _supabase.from('stories').select('*').order('created_at', { ascending: true });
    if (error) return;

    if (stories && stories.length > 0) {
        // তারিখ অনুযায়ী একটি নির্দিষ্ট ইন্ডেক্স বের করা (যাতে সব ইউজার ওইদিন একই গল্প দেখে)
        const today = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
        const index = today % stories.length;
        const todayStory = stories[index];
        
        dailyStoryId = todayStory.id; // আজকের আনলকড গল্পের আইডি সেভ রাখা
        
        // আজকের ডেইলি ফ্রি গল্পটি আইফ্রেমে লোড করা
        playStory(todayStory, true); 
        renderSidebar(stories);
    }
}

// playStory ফাংশনে isDailyFree প্যারামিটার যোগ করা হয়েছে
function playStory(story, isDailyFree = false) {
    const frame = document.getElementById('storyFrame');
    const overlay = document.getElementById('lockOverlay');
    
    // যদি ইউজার পেইড হয় অথবা এটি আজকের 'ডেইলি ফ্রি গিফট' গল্প হয়, তবে সরাসরি দেখাবে
    if (userStatus === 'paid' || isDailyFree || story.id === dailyStoryId) {
        overlay.classList.add('hidden');
        const content = story.content || "কোনো গল্প পাওয়া যায়নি।"; //
        const storyHtml = `<html><head><link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri&display=swap" rel="stylesheet"><style>body{font-family:'Hind Siliguri',sans-serif;padding:8% 6%;line-height:1.8;background:#FDFBF7;color:#263238;font-size:1.6rem; text-align:justify;}</style></head><body>${content.replace(/\n/g, '<br>')}</body></html>`;
        const blob = new Blob([storyHtml], { type: 'text/html' });
        frame.src = URL.createObjectURL(blob);
    } else {
        // অন্য সব প্রিমিয়াম গল্পের জন্য লক স্ক্রিন দেখাবে
        frame.src = "about:blank";
        overlay.classList.remove('hidden');
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
        
        // ফ্রি ইউজারদের জন্য সব প্রিমিয়াম গল্পে লক আইকন দেখাবে (আজকের ফ্রি গল্প বাদে)
        const isCurrentlyFree = (s.id === dailyStoryId);
        const lockIcon = (userStatus === 'free' && s.is_premium && !isCurrentlyFree) ? '🔒 ' : '';
        
        banner.innerHTML = `<div style="background:rgba(0,0,0,0.6);color:white;padding:8px;width:100%;font-size:0.9rem;">${lockIcon}${s.title}</div>`; //
        banner.onclick = () => { playStory(s); window.scrollTo({ top: 0, behavior: 'smooth' }); };
        sidebarList.appendChild(banner);
    });
}

document.addEventListener('DOMContentLoaded', initApp);
