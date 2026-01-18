/* --- PoshuPakhi Golpo - Nuromarketers Edition v24.0 --- */
const SUPABASE_URL = 'https://xptwwlrcygimfislsutz.supabase.co'.trim(); 
const SUPABASE_ANON_KEY = 'sb_publishable_N0YqY-tMEW_KWxFdS7zgVA_3CgR8Go-'.trim();
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let userStatus = 'free'; 
let dailyStoryId = null;
let currentStoryText = ""; 
let currentStoryTitle = "";

// ১. পেমেন্ট সিস্টেম: হোয়াটসঅ্যাপ ইন্টিগ্রেশন
window.initPayment = () => {
    const userId = localStorage.getItem('device_uuid') || 'Unknown';
    const phoneNumber = "8801303680618";
    const message = `আসসালামু আলাইকুম। আমি 'পশুপাখি গল্প' অ্যাপটির আজীবনের জন্য প্রিমিয়াম এক্সেস নিতে চাই। \n\nসাপোর্ট আইডি: ${userId}\nএই ইউজার আইডির জন্য বাচ্চাদের পশু-পাখির গল্পগুলো আনলক করতে চাচ্ছি।`;
    window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, '_blank');
};

// ২. স্মার্ট শেয়ার (৬০% কন্টেন্ট + সাইট লিঙ্ক) - FIXED
window.shareApp = async () => {
    if (!currentStoryText) {
        alert("আগে একটি গল্প সিলেক্ট করুন!");
        return;
    }
    
    const shareLength = Math.floor(currentStoryText.length * 0.6);
    const shortText = currentStoryText.substring(0, shareLength);
    const siteLink = window.location.origin; // আপনার সাইটের মেইন লিঙ্ক
    
    const shareMessage = `📖 ${currentStoryTitle}\n\n${shortText}...\n\nবাকি গল্পটি পড়তে ভিজিট করুন: ${siteLink}`;

    if (navigator.share) {
        try { 
            await navigator.share({ 
                title: 'পশুপাখি গল্প', 
                text: shareMessage,
                url: siteLink // সরাসরি লিঙ্ক প্যারামিটার যুক্ত করা হয়েছে
            }); 
        } catch (e) { console.log("Share failed"); }
    } else { 
        navigator.clipboard.writeText(shareMessage + "\n" + siteLink);
        alert("গল্পের ৬০% এবং সাইট লিঙ্ক কপি হয়েছে! বন্ধুদের পাঠিয়ে দিন।"); 
    }
};

// ৩. ফুল-স্ক্রিন লজিক - FIXED
document.getElementById('fullscreenBtn')?.addEventListener('click', () => {
    const playerArea = document.getElementById('playerArea');
    if (!document.fullscreenElement && !document.webkitFullscreenElement) {
        if (playerArea.requestFullscreen) playerArea.requestFullscreen();
        else if (playerArea.webkitRequestFullscreen) playerArea.webkitRequestFullscreen();
        else if (playerArea.msRequestFullscreen) playerArea.msRequestFullscreen();
    } else {
        if (document.exitFullscreen) document.exitFullscreen();
        else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
    }
});

// ৪. গল্প প্লে করার লজিক
async function fetchAndPlay(storyId, isDailyFree = false) {
    const frame = document.getElementById('storyFrame');
    const overlay = document.getElementById('lockOverlay');

    if (userStatus === 'paid' || isDailyFree || storyId === dailyStoryId) {
        if (overlay) overlay.classList.add('hidden');
        const { data: story } = await _supabase.from('stories').select('*').eq('id', storyId).single();
        
        currentStoryText = story.content; 
        currentStoryTitle = story.title;

        const storyHtml = `
        <html>
        <head>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Hind+Siliguri&display=swap');
                body { margin:0; background:#FDFBF7; font-family:'Hind Siliguri', sans-serif; padding:20px; user-select: none; -webkit-user-select: none; }
                .card { background:white; padding:30px; border-radius:25px; box-shadow:0 5px 15px rgba(0,0,0,0.03); }
                h1 { color:#2E7D32; text-align:center; font-size: 1.4rem; margin-bottom: 15px; }
                p { line-height:1.8; font-size:1.2rem; text-align:justify; color:#333; }
            </style>
        </head>
        <body oncontextmenu="return false;">
            <div class="card"><h1>${story.title}</h1><p>${story.content.replace(/\n/g, '<br>')}</p></div>
        </body>
        </html>`;
        if (frame.src.startsWith('blob:')) URL.revokeObjectURL(frame.src);
        frame.src = URL.createObjectURL(new Blob([storyHtml], { type: 'text/html' }));
    } else {
        frame.src = "about:blank";
        if (overlay) overlay.classList.remove('hidden');
    }
}

// ৫. সাইডবার রেন্ডার ও অটো-স্ক্রোল
function renderSidebar(stories) {
    const list = document.getElementById('storyList');
    if(!list) return;
    list.innerHTML = '';
    const colors = ['#FFD1DC', '#D1F2EB', '#FFF4BD', '#E1F5FE', '#F3E5F5'];

    stories.forEach((s, index) => {
        const banner = document.createElement('div');
        banner.className = 'story-banner';
        banner.style.backgroundColor = colors[index % colors.length];
        const isLocked = (userStatus === 'free' && s.id !== dailyStoryId);
        banner.innerHTML = `<div>${isLocked ? '🔒 ' : ''}${s.title}</div>`;
        banner.onclick = () => fetchAndPlay(s.id);
        list.appendChild(banner);
    });
}

function startAutoScroll() {
    const list = document.getElementById('storyList');
    let speed = 0.4;
    let isUserInteracting = false;
    list.addEventListener('mouseenter', () => isUserInteracting = true);
    list.addEventListener('mouseleave', () => isUserInteracting = false);
    list.addEventListener('touchstart', () => isUserInteracting = true);
    list.addEventListener('touchend', () => setTimeout(() => isUserInteracting = false, 2000));

    function scroll() {
        if (!isUserInteracting) {
            list.scrollTop += speed;
            if (list.scrollTop >= list.scrollHeight - list.clientHeight) list.scrollTop = 0;
        }
        requestAnimationFrame(scroll);
    }
    requestAnimationFrame(scroll);
}

// অ্যাপ শুরু
async function initApp() {
    let uuid = localStorage.getItem('device_uuid') || self.crypto.randomUUID();
    localStorage.setItem('device_uuid', uuid);
    if(document.getElementById('footerUid')) document.getElementById('footerUid').innerText = uuid;

    try {
        const { count } = await _supabase.from('stories').select('*', { count: 'exact', head: true });
        document.querySelectorAll('#totalCount').forEach(el => el.innerText = count || 0);

        const { data: user } = await _supabase.from('users').select('status').eq('device_uuid', uuid).maybeSingle();
        if (user?.status === 'paid') {
            userStatus = 'paid';
            document.querySelectorAll('.premium-banner, .lock-overlay').forEach(el => el.style.display = 'none');
        }
        
        const { data: stories } = await _supabase.from('stories').select('id, title').order('created_at', { ascending: true });
        if (stories) {
            dailyStoryId = stories[Math.floor(Date.now() / 86400000) % stories.length].id;
            fetchAndPlay(dailyStoryId, true);
            renderSidebar(stories);
            startAutoScroll();
        }
    } catch (err) { console.error(err); }
}

document.addEventListener('DOMContentLoaded', initApp);
