/* --- PoshuPakhi Golpo - Nuromarketers Edition v27.0 --- */
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

window.shareApp = async () => {
    if (!currentStoryText) {
        alert("আগে একটি গল্প পড়তে শুরু করুন!");
        return;
    }
    const shareLength = Math.floor(currentStoryText.length * 0.4);
    const shortText = currentStoryText.substring(0, shareLength);
    const siteUrl = window.location.origin; 
    
    const shareMessage = `📖 ${currentStoryTitle}\n\n${shortText}...\n\nগল্পটি কি আপনার সোনামণিকে শোনাবেন? পুরোটি পড়তে এবং আরও গল্পের জন্য এখানে ক্লিক করুন: ${siteUrl}`;

    if (navigator.share) {
        try { 
            await navigator.share({ 
                title: 'পশুপাখি গল্প ✨', 
                text: shareMessage,
                url: siteUrl
            }); 
        } catch (e) { console.log("Sharing cancelled"); }
    } else { 
        navigator.clipboard.writeText(shareMessage);
        alert("গল্পের ৪০% এবং লিঙ্ক কপি হয়েছে! বন্ধুদের পাঠিয়ে দিন।"); 
    }
};

document.getElementById('fullscreenBtn')?.addEventListener('click', () => {
    const playerArea = document.getElementById('playerArea');
    if (!document.fullscreenElement && !document.webkitFullscreenElement) {
        if (playerArea.requestFullscreen) playerArea.requestFullscreen();
        else if (playerArea.webkitRequestFullscreen) playerArea.webkitRequestFullscreen();
    } else {
        if (document.exitFullscreen) document.exitFullscreen();
        else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
    }
});

// ৪. আপডেট করা স্টোরি প্লেয়ার (২০% প্রিভিউ + নিউরোমার্কেটিং)
async function fetchAndPlay(storyId, isDailyFree = false) {
    const frame = document.getElementById('storyFrame');
    const overlay = document.getElementById('lockOverlay');

    // ডাটাবেজ থেকে গল্প নিয়ে আসা
    const { data: story } = await _supabase.from('stories').select('*').eq('id', storyId).single();
    if (!story) return;

    currentStoryText = story.content; 
    currentStoryTitle = story.title;

    let contentToDisplay = "";
    let showMarketing = false;

    // ৫. অ্যাক্সেস লজিক: পেইড ইউজার অথবা আজকের ফ্রি গল্প হলে ১০০% দেখাবে
    if (userStatus === 'paid' || isDailyFree || storyId === dailyStoryId) {
        if (overlay) overlay.classList.add('hidden');
        contentToDisplay = story.content;
    } else {
        // ফ্রি ভার্সনে ২০% কন্টেন্ট লোড হবে
        if (overlay) overlay.classList.add('hidden'); // আইফ্রেমের ভিতরেই লক দেখানো হবে
        const slicePoint = Math.floor(story.content.length * 0.2);
        contentToDisplay = story.content.substring(0, slicePoint) + "...";
        showMarketing = true;
    }

    const storyHtml = `
    <html>
    <head>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Hind+Siliguri&display=swap');
            body { margin:0; background:#FDFBF7; font-family:'Hind Siliguri', sans-serif; padding:25px; user-select: none; }
            .card { background:white; padding:35px; border-radius:30px; box-shadow:0 10px 30px rgba(0,0,0,0.03); border: 2px solid #E8F5E9; }
            h1 { color:#2E7D32; text-align:center; font-size: 1.5rem; margin-bottom: 20px; border-bottom: 2px dashed #2E7D32; padding-bottom: 10px; }
            p { line-height:2; font-size:1.3rem; text-align:justify; color:#333; }
            
            /* নিউরোমার্কেটিং কন্টেন্ট স্টাইল */
            .marketing-box { background: #f0fdf4; padding: 25px; border-radius: 20px; border: 2px dashed #2E7D32; margin-top: 20px; text-align: center; }
            .m-title { color: #166534; font-weight: bold; font-size: 1.2rem; margin-bottom: 15px; display: block; }
            .benefit-item { text-align: left; margin: 10px 0; font-size: 1rem; color: #374151; list-style: none; }
            .unlock-btn { background: #2E7D32; color: white; border: none; padding: 15px 30px; border-radius: 50px; font-weight: bold; font-size: 1.1rem; cursor: pointer; margin-top: 15px; display: inline-block; text-decoration: none; }
            .free-link { display: block; margin-top: 15px; color: #6b7280; font-size: 0.9rem; text-decoration: underline; cursor: pointer; }
        </style>
    </head>
    <body oncontextmenu="return false;">
        <div class="card">
            <h1>${story.title}</h1>
            <p>${contentToDisplay.replace(/\n/g, '<br>')}</p>
            
            ${showMarketing ? `
            <div class="marketing-box">
                <span class="m-title">মাশাআল্লাহ! আপনার সন্তানকে উত্তম নৈতিক শিক্ষায় শিক্ষিত করার প্রচেষ্টার জন্য আন্তরিক মোবারকবাদ!</span>
                <div class="benefit-item">✅ পশু-পাখিদের মজার গল্প যা সোনামণির শৈশবকে আনন্দময় করবে।</div>
                <div class="benefit-item">✅ ইতিহাস, বিজ্ঞান ও মহামানবদের জীবনী থেকে শিক্ষার রোডম্যাপ।</div>
                <div class="benefit-item">✅ বাংলা-ইংরেজি দুই ভাষায় ইংরেজি দক্ষতা বাড়বে ইনশাআল্লাহ।</div>
                <div class="benefit-item">✅ সন্তানের সাথে আপনার বোঝাপড়া ও ভালোবাসা বাড়বে।</div>
                
                <p style="font-size: 0.95rem; margin-top:15px;">এটি আপনার সন্তানের জন্য লাইফটাইম ইনভেস্টমেন্ট, আর আমাদের জন্য কাজের মোটিভেশন।</p>
                
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
