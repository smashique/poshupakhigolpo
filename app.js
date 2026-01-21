/* --- PoshuPakhi Golpo - Advanced Dynamic Stack v34.1 --- */
const SUPABASE_URL = 'https://xptwwlrcygimfislsutz.supabase.co'.trim(); 
const SUPABASE_ANON_KEY = 'sb_publishable_N0YqY-tMEW_KWxFdS7zgVA_3CgR8Go-'.trim();
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let userStatus = 'free'; 
let dailyStoryId = null; 
let currentStoryTitle = ""; 
let currentStoryId = null; 
let allStories = [];

// ১. ডাইনামিক ইমেজ জেনারেশন ও স্মার্ট শেয়ারিং
window.shareApp = async () => {
    if (!currentStoryId) return alert("আগে একটি গল্প নির্বাচন করুন!");

    const shareUrl = `${window.location.origin}/?story=${currentStoryId}`;
    
    try {
        const canvas = document.createElement('canvas');
        canvas.width = 1200; canvas.height = 630; 
        const ctx = canvas.getContext('2d');

        // কার্ড ডিজাইন (বাচ্চাদের উপযোগী কালার প্যালেট)
        ctx.fillStyle = '#F1F8E9'; ctx.fillRect(0, 0, 1200, 630);
        ctx.strokeStyle = '#2E7D32'; ctx.lineWidth = 20; ctx.strokeRect(40, 40, 1120, 550);
        
        ctx.fillStyle = '#1B5E20'; ctx.textAlign = 'center';
        ctx.font = 'bold 65px "Hind Siliguri", sans-serif';
        
        // স্বয়ংক্রিয়ভাবে গল্পের নাম বসানো
        const lines = wrapText(ctx, `📖 ${currentStoryTitle}`, 1000);
        lines.forEach((line, i) => {
            ctx.fillText(line, 600, 250 + (i * 90));
        });

        ctx.font = 'italic 40px "Quicksand", sans-serif';
        ctx.fillStyle = '#78909C';
        ctx.fillText("poshupakhigolpo.online", 600, 540);

        canvas.toBlob(async (blob) => {
            const file = new File([blob], 'story-card.png', { type: 'image/png' });
            
            // সোশ্যাল মিডিয়ায় ইমেজ হিসেবে শেয়ার করার ডেটা
            const shareData = {
                title: 'পশুপাখি গল্প',
                text: `✨ সোনামণির জন্য চমৎকার একটি গল্প! পড়ুন এখানে: \n🔗 ${shareUrl}`,
                files: [file]
            };

            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share(shareData);
            } else {
                // পিসি ব্রাউজার বা সাপোর্ট না থাকলে সাধারণ কপি
                navigator.clipboard.writeText(`📖 ${currentStoryTitle}\n🔗 ${shareUrl}`);
                alert("গল্পের লিঙ্ক কপি করা হয়েছে!");
            }
        });
    } catch (err) { console.error("Sharing failed", err); }
};

// টেক্সট র‍্যাপিং লজিক
function wrapText(ctx, text, maxWidth) {
    const words = text.split(' '); let lines = []; let currentLine = words[0];
    for (let i = 1; i < words.length; i++) {
        if (ctx.measureText(currentLine + " " + words[i]).width < maxWidth) {
            currentLine += " " + words[i];
        } else { lines.push(currentLine); currentLine = words[i]; }
    }
    lines.push(currentLine); return lines;
}

// ২. স্টোরি ইঞ্জিন ও আপনার সেই অমূল্য নিউরোমার্কেটিং কন্টেন্ট
async function fetchAndPlay(storyId, isDailyFree = false, isAutoLoad = false) {
    const story = allStories.find(s => String(s.id) === String(storyId));
    if (!story) return;
    
    currentStoryId = storyId; 
    currentStoryTitle = story.title;

    let canReadFull = (
        userStatus === 'paid' || 
        isDailyFree === true || 
        String(storyId) === String(dailyStoryId) || 
        story.is_premium === false || 
        story.is_premium === null ||
        String(story.is_premium) === 'false'
    );

    let isLocked = !canReadFull;
    let content = canReadFull ? story.content : story.content.substring(0, Math.floor(story.content.length * 0.2)) + "...";

    // আপনার সেই নির্দিষ্ট এবং অত্যন্ত পরিশ্রমী মার্কেটিং বক্স
    const marketingBoxHTML = `
    <div class="m-box">
        <strong style="color: #1b5e20; font-size: 1.25rem; display: block; margin-bottom: 10px;">
            মাশাআল্লাহ! আপনার এতদূর আসাটা প্রমাণ করে ভবিষ্যৎ লিজেন্ড এর মা-বাবা হওয়ার জন্য আপনি সম্পূর্ণ প্রস্তুত! আপনি চান...
        </strong>
        <div style="text-align: left; display: inline-block; font-size: 1.1rem; color: #333; line-height: 1.6;">
            ✔ আপনার সন্তানের শৈশবকে আনন্দময় করতে।<br>
            ✔ সন্তানকে শিশুসুলভ ভাষায় এমন কিছু বুঝাতে যা তাকে আগামীর কিংবদন্তী বানিয়ে দেয়!<br>
            ✔ আপনি আপনার সন্তানকে দুনিয়া ও আখিরাত উভয় ক্ষেত্রেই সফল হিসেবে গড়ে তুলতে চান।<br>
            ✔ আপনি সন্তানদের দিয়ে গল্পের আসর বসান, তাদেরকে নিজে গল্প পড়ে শোনান। তাই আপনার সন্তানের সাথে আপনার আছে চমৎকার বোঝাপড়া!
        </div>
        <div style="background: #fff; padding: 15px; border-radius: 15px; margin: 20px 0; border: 1px solid #c8e6c9;">
            <p style="font-size: 1.05rem; color: #444; line-height: 1.6; margin-bottom: 15px;">
                আপনার মিশন শুরু করার আর মাত্র একটি ধাপ বাকি! কেন পশু-পাখিদের গল্পের এই অগ্রসরমান <strong>বিশ্বকোষ</strong>টি আপনার সন্তানকে পড়ে শোনানোর জন্য আনলক করবেন? কারন, যখন আপনি কোন কাজে জান-মাল ব্যয় করেন সে কাজটি আপনার কাছে বিশেষ গুরুত্ব পায়। এটি আপনার সন্তানের জন্য আপনার <strong> ইনভেস্টমেন্ট </strong> আর আমাদের জন্য আমাদের কাজের Continuation বজায় রাখার <strong> মোটিভেশান! </strong>
            </p>
            <div style="font-size: 1.5rem; font-weight: bold; margin-bottom: 10px;">
                লাইফটাইম অফার: <del style="color: #999;">৳৪৯৯</del> <span style="color: #d32f2f; background: #fff9c4; padding: 2px 10px; border-radius: 8px;">৳২৯৯</span>
            </div>
            <button onclick="window.parent.initPayment()" class="btn">আজীবনের জন্য আনলক করুন</button>
        </div>
        <p style="font-size: 0.95rem; color: #666;">এখনই আনলক করতে না চাইলে <span onclick="window.parent.location.reload()" style="color: #2E7D32; text-decoration: underline; cursor: pointer; font-weight: bold;">আজকের ফ্রি গল্পটি</span> পড়ুন।</p>
    </div>`;

    const storyHtml = `<html><head><style>
        @import url('https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;700&family=Quicksand:wght@500;700&display=swap');
        body { margin:0; background:#FDFBF7; font-family: 'Quicksand', 'Hind Siliguri', sans-serif; padding:25px; user-select:none; color:#333; }
        .card { background:white; padding:35px; border-radius:30px; border: 2px solid #E8F5E9; text-align:center; }
        h1 { color:#2E7D32; font-size: 1.8rem; border-bottom: 2px dashed #A5D6A7; padding-bottom: 15px; font-weight: 700; margin-top: 0; }
        p { line-height: 1.8; font-size: 1.4rem; text-align:justify; font-weight: 500; }
        .m-box { background:#f0fdf4; padding:25px; border-radius:25px; border:2px dashed #2E7D32; margin-top:30px; }
        .btn { background:#2E7D32; color:white; border:none; padding:16px 40px; border-radius:50px; font-weight:700; cursor:pointer; font-family: inherit; font-size: 1.1rem; }
    </style></head><body><div class="card"><h1>${story.title}</h1><p>${content.replace(/\n/g, '<br>')}</p>${isLocked ? marketingBoxHTML : ''}</div></body></html>`;
    
    document.getElementById('storyFrame').src = URL.createObjectURL(new Blob([storyHtml], { type: 'text/html' }));
}

// ৩. ডিপ লিঙ্কিং ও ইনিশিয়ালাইজেশন লজিক
async function initApp() {
    let uuid = localStorage.getItem('device_uuid') || self.crypto.randomUUID();
    localStorage.setItem('device_uuid', uuid);
    if(document.getElementById('footerUid')) document.getElementById('footerUid').innerText = uuid;

    try {
        const { data: user } = await _supabase.from('users').select('status').eq('device_uuid', uuid).maybeSingle();
        if (user?.status === 'paid') userStatus = 'paid';
        
        const { data: stories } = await _supabase.from('stories').select('*').order('created_at', { ascending: true });
        if (stories) {
            allStories = stories;
            document.getElementById('totalCount').innerText = stories.length;
            
            const seriesSelect = document.getElementById('seriesSelect');
            const seriesList = [...new Set(stories.map(s => s.series_name || 'একক গল্প'))];
            seriesList.forEach(name => {
                const opt = document.createElement('option'); opt.value = name; opt.innerText = name; seriesSelect.appendChild(opt);
            });

            const urlParams = new URLSearchParams(window.location.search);
            const storyIdFromUrl = urlParams.get('story');

            if (storyIdFromUrl) {
                fetchAndPlay(storyIdFromUrl, true, true); 
            } else {
                dailyStoryId = stories[Math.floor(Date.now() / 86400000) % stories.length].id;
                fetchAndPlay(dailyStoryId, true, true);
            }
            renderSidebar(stories);
        }
    } catch (e) { console.error("Init Error", e); }
}

// ... বাকি বাটন এবং রেন্ডার ফাংশনসমূহ হুবহু আগের মতো রাখা হয়েছে ...
document.addEventListener('DOMContentLoaded', initApp);
