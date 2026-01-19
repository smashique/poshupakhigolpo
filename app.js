/* --- PoshuPakhi Golpo - Nuromarketers Final Edition v28.0 --- */
const SUPABASE_URL = 'https://xptwwlrcygimfislsutz.supabase.co'.trim(); 
const SUPABASE_ANON_KEY = 'sb_publishable_N0YqY-tMEW_KWxFdS7zgVA_3CgR8Go-'.trim();
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let userStatus = 'free'; 
let dailyStoryId = null;
let currentStoryText = ""; 
let currentStoryTitle = "";

window.initPayment = () => {
    window.location.href = 'payment.html'; 
};

// ২. শেয়ার বাটন মার্কেটিং (Curiosity Hook)
window.shareApp = async () => {
    if (!currentStoryTitle) {
        alert("আগে একটি গল্প পড়তে শুরু করুন!");
        return;
    }
    const siteUrl = window.location.origin; 
    
    // মার্কেটিং মেসেজ: শুধুমাত্র নাম এবং সাইট লিঙ্ক যা কিউরিওসিটি তৈরি করবে
    const shareMessage = `📖 '${currentStoryTitle}' - সোনামণির জন্য একটি চমৎকার শিক্ষামূলক গল্প! ✨\n\nপুরো গল্পটি পড়তে এবং আরও মজার গল্পের জন্য আজই ভিজিট করুন:\n🔗 ${siteUrl}`;

    if (navigator.share) {
        try { 
            await navigator.share({ 
                title: 'পشুপাখি গল্প ✨', 
                text: shareMessage,
                url: siteUrl
            }); 
        } catch (e) { console.log("Sharing cancelled"); }
    } else { 
        navigator.clipboard.writeText(shareMessage);
        alert("গল্পের লিঙ্ক এবং আমন্ত্রণ কপি হয়েছে! বন্ধুদের পাঠিয়ে দিন।"); 
    }
};

document.getElementById('fullscreenBtn')?.addEventListener('click', () => {
    const playerArea = document.getElementById('playerArea');
    if (!document.fullscreenElement && !document.webkitFullscreenElement) {
        if (playerArea.requestFullscreen) playerArea.requestFullscreen();
        else if (playerArea.webkitRequestFullscreen) playerArea.webkitRequestFullscreen();
    } else {
        if (document.exitFullscreen) document.exitFullscreen();
    }
});

// ৩. ট্রাস্ট সেকশন ডাটা (সুপাবেস থেকে পেইড ইউজার কাউন্ট)
async function updateTrustSection() {
    try {
        const { count, error } = await _supabase
            .from('users')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'paid'); 

        if (!error && count > 0) {
            const el = document.getElementById('paidCount');
            if(el) el.innerText = count;
            document.getElementById('trustBox')?.classList.remove('hidden');
        }
    } catch (err) { console.error(err); }
}

// ৪. স্টোরি প্লেয়ার (২০% প্রিভিউ + প্রাইস অ্যাঙ্কর মার্কেটিং)
async function fetchAndPlay(storyId, isDailyFree = false) {
    const frame = document.getElementById('storyFrame');
    const { data: story } = await _supabase.from('stories').select('*').eq('id', storyId).single();
    if (!story) return;

    currentStoryText = story.content; 
    currentStoryTitle = story.title;

    let contentToDisplay = "";
    let showMarketing = false;

    if (userStatus === 'paid' || isDailyFree || storyId === dailyStoryId) {
        contentToDisplay = story.content;
    } else {
        const slicePoint = Math.floor(story.content.length * 0.2);
        contentToDisplay = story.content.substring(0, slicePoint) + "...";
        showMarketing = true;
    }

    const storyHtml = `
    <html>
    <head>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;700&display=swap');
            body { margin:0; background:#FDFBF7; font-family:'Hind Siliguri', sans-serif; padding:25px; user-select: none; }
            .card { background:white; padding:35px; border-radius:30px; box-shadow:0 10px 30px rgba(0,0,0,0.03); border: 2px solid #E8F5E9; }
            h1 { color:#2E7D32; text-align:center; font-size: 1.5rem; margin-bottom: 20px; border-bottom: 2px dashed #2E7D32; padding-bottom: 10px; }
            p { line-height:2; font-size:1.35rem; text-align:justify; color:#333; }
            .m-box { background: #f0fdf4; padding: 25px; border-radius: 20px; border: 2px dashed #2E7D32; margin-top: 25px; text-align: center; }
            .m-title { color: #166534; font-weight: bold; font-size: 1.2rem; margin-bottom: 15px; display: block; }
            .price-tag { font-size: 1.4rem; margin: 15px 0; font-weight: bold; }
            .old-p { text-decoration: line-through; color: #999; margin-right: 10px; }
            .new-p { color: #d32f2f; background: #fff9c4; padding: 2px 10px; border-radius: 8px; }
            .unlock-btn { background: #2E7D32; color: white; border: none; padding: 15px 30px; border-radius: 50px; font-weight: bold; font-size: 1.15rem; cursor: pointer; display: inline-block; text-decoration: none; box-shadow: 0 4px 15px rgba(46, 125, 50, 0.3); }
            .free-link { display: block; margin-top: 15px; color: #6b7280; font-size: 0.95rem; text-decoration: underline; cursor: pointer; }
        </style>
    </head>
    <body oncontextmenu="return false;">
        <div class="card">
            <h1>${story.title}</h1>
            <p>${contentToDisplay.replace(/\n/g, '<br>')}</p>
            ${showMarketing ? `
            <div class="m-box">
                <span class="m-title">মাশাআল্লাহ! আপনার সন্তানকে উত্তম নৈতিক শিক্ষায় শিক্ষিত করার প্রচেষ্টার জন্য আন্তরিক মোবারকবাদ!</span>
                <p style="font-size: 1rem; color: #444; text-align: left; line-height: 1.6;">
                ✔ মজার ও শিক্ষামূলক গল্প যা সন্তানের শৈশবকে আনন্দময় করবে।<br>
                ✔ ইতিহাস ও বিজ্ঞান থেকে নেয়া শিক্ষার রোডম্যাপ।<br>
                ✔ বাংলা-ইংরেজি দুই ভাষায় ইংরেজি দক্ষতা বাড়বে।<br>
                ✔ সন্তানের সাথে আপনার আত্মিক বোঝাপড়া বাড়বে।
                </p>
                <div class="price-tag">লাইফটাইম অফার: <span class="old-p">৳৪৯৯</span> <span class="new-p">৳২৯৯</span></div>
                <button onclick="window.parent.initPayment()" class="unlock-btn">আজীবনের জন্য আনলক করুন</button>
                <span class="free-link" onclick="window.parent.location.reload()">না চাইলে আজকের ফ্রি গল্পটি পড়ুন</span>
            </div>
            ` : ''}
        </div>
    </body>
    </html>`;
    if (frame.src.startsWith('blob:')) URL.revokeObjectURL(frame.src);
    frame.src = URL.createObjectURL(new Blob([storyHtml], { type: 'text/html' }));
}

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
    function scroll() {
        if (!isUserInteracting) {
            list.scrollTop += speed;
            if (list.scrollTop >= list.scrollHeight - list.clientHeight) list.scrollTop = 0;
        }
        requestAnimationFrame(scroll);
    }
    requestAnimationFrame(scroll);
}

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
            updateTrustSection(); // ট্রাস্ট সেকশন লোড করা
        }
    } catch (err) { console.error(err); }
}
document.addEventListener('DOMContentLoaded', initApp);
