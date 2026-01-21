/* --- PoshuPakhi Golpo - Colorful Line Art SVG Template v36.0 --- */
const SUPABASE_URL = 'https://xptwwlrcygimfislsutz.supabase.co'.trim(); 
const SUPABASE_ANON_KEY = 'sb_publishable_N0YqY-tMEW_KWxFdS7zgVA_3CgR8Go-'.trim();
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let userStatus = 'free'; let dailyStoryId = null; 
let currentStoryTitle = ""; let currentStoryId = null; let allStories = [];

// ১. ডাইনামিক SVG-স্টাইল কার্ড জেনারেশন ও স্মার্ট শেয়ারিং
window.shareApp = async () => {
    if (!currentStoryId) return alert("আগে একটি গল্প শুরু করুন!");
    const shareUrl = `${window.location.origin}/?story=${currentStoryId}`;
    try {
        const canvas = document.createElement('canvas');
        canvas.width = 1200; canvas.height = 630; 
        const ctx = canvas.getContext('2d');
        
        // --- নতুন ডিজাইন টেমপ্লেট (Colorful Line Art Animals) ---
        // ব্যাকগ্রাউন্ড: সফট ক্রিম কালার
        ctx.fillStyle = '#FFFBF0'; ctx.fillRect(0, 0, 1200, 630);
        
        // ডেকোরেটিভ আর্ট ড্রইং (চোখ-মুখ ছাড়া রঙিন প্রাণী)
        drawColorfulLineArtAnimals(ctx);

        // গল্পের শিরোনাম (Visual Hierarchy: সবচেয়ে বড় ও বোল্ড)
        ctx.fillStyle = '#2E7D32'; ctx.textAlign = 'center';
        ctx.font = 'bold 75px "Hind Siliguri", sans-serif';
        const lines = wrapText(ctx, `📖 ${currentStoryTitle}`, 1000);
        // টেক্সটটিকে একটু উপরে উঠানো হয়েছে যাতে প্রাণীদের ওপর না পড়ে
        const startY = 250 - ((lines.length - 1) * 40);
        lines.forEach((line, i) => ctx.fillText(line, 600, startY + (i * 95)));

        // ব্র্যান্ডিং ও লিঙ্ক (ফুটার)
        ctx.font = 'bold 35px "Quicksand", sans-serif'; ctx.fillStyle = '#1B5E20';
        ctx.fillText("পশুপাখি গল্প - সোনামণিদের নিরাপদ ভুবন ✨", 600, 500);
        ctx.font = 'italic 30px "Quicksand", sans-serif'; ctx.fillStyle = '#546E7A';
        ctx.fillText("poshupakhigolpo.online", 600, 550);

        canvas.toBlob(async (blob) => {
            const file = new File([blob], 'story-card.png', { type: 'image/png' });
            
            // ক্যাপশন ফিক্স: লিঙ্কটি টেক্সটের মধ্যে স্পষ্টভাবে দেওয়া হয়েছে
            const captionText = `✨ চমৎকার এই গল্পটি "${currentStoryTitle}" আপনার সোনামণিকে আজই পড়ে শোনান!\n\nগল্পটি পড়তে নিচের লিঙ্কে ক্লিক করুন: 👇\n🔗 ${shareUrl}`;
            
            const shareData = {
                title: 'পশুপাখি গল্প',
                text: captionText, 
                files: [file]
            };

            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                try {
                    await navigator.share(shareData);
                } catch (err) {
                    // শেয়ার ক্যান্সেল বা ফেইল করলে ফলব্যাক
                    console.log("Share API failed, using fallback");
                    fallbackShare(captionText);
                }
            } else {
                // পিসি বা ব্রাউজার সাপোর্ট না করলে ফলব্যাক
                fallbackShare(captionText);
            }
        });
    } catch (err) { console.error("Error generating card", err); }
};

// ফলব্যাক শেয়ার ফাংশন (ক্লিপবোর্ডে কপি)
function fallbackShare(text) {
    navigator.clipboard.writeText(text);
    alert("গল্পের লিঙ্ক ও ক্যাপশন কপি করা হয়েছে! আপনি এখন যেকোনো জায়গায় পেস্ট করতে পারেন।");
}

// --- নতুন ড্রইং ফাংশন (Colorful Line Art - No Eyes) ---
function drawColorfulLineArtAnimals(ctx) {
    ctx.lineWidth = 8; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    
    // ১. জিরাফ (ডানপাশে, কমলা-হলুদ লাইন)
    ctx.strokeStyle = '#FFB300'; ctx.beginPath();
    // গলা ও মাথা (সরলীকৃত)
    ctx.moveTo(950, 450); ctx.quadraticCurveTo(920, 200, 980, 150); // গলা
    ctx.quadraticCurveTo(1020, 130, 1050, 160); // মাথা
    ctx.quadraticCurveTo(1080, 200, 1050, 250); 
    ctx.lineTo(1020, 450); // পিঠ
    // শিং (ছোট লাইন)
    ctx.moveTo(1000, 130); ctx.lineTo(990, 100);
    ctx.moveTo(1030, 130); ctx.lineTo(1040, 100);
    ctx.stroke();

    // ২. হাতি (বামপাশে, নীল-আकाशी লাইন)
    ctx.strokeStyle = '#42A5F5'; ctx.beginPath();
    // শরীর ও মাথা
    ctx.moveTo(150, 480); ctx.quadraticCurveTo(100, 300, 250, 280); // পিঠ ও মাথা
    ctx.quadraticCurveTo(350, 280, 400, 350);
    // শুঁড় (বাঁকানো লাইন)
    ctx.quadraticCurveTo(450, 400, 500, 380); ctx.quadraticCurveTo(520, 370, 530, 400);
    // কান (বড় কার্ভ)
    ctx.moveTo(250, 320); ctx.quadraticCurveTo(180, 350, 200, 450);
    ctx.stroke();

    // ৩. সিংহ (মাঝখানে নিচে, সোনালি-বাদামী লাইন)
    ctx.strokeStyle = '#8D6E63'; ctx.beginPath();
    // কেশর (Gode)
    ctx.moveTo(500, 550); ctx.quadraticCurveTo(450, 450, 550, 400);
    ctx.quadraticCurveTo(650, 380, 750, 420); ctx.quadraticCurveTo(800, 500, 750, 550);
    // শরীর (সামান্য অংশ)
    ctx.moveTo(550, 550); ctx.lineTo(700, 550);
    ctx.stroke();
    
    // ৪. লতাপাতা ও ঘাস (নিচে, সবুজ লাইন)
    ctx.strokeStyle = '#66BB6A'; ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(50, 580); ctx.quadraticCurveTo(100, 550, 150, 580);
    ctx.moveTo(1050, 580); ctx.quadraticCurveTo(1100, 550, 1150, 580);
    ctx.moveTo(400, 600); ctx.quadraticCurveTo(450, 560, 500, 600);
    ctx.stroke();
}

function wrapText(ctx, text, maxWidth) {
    const words = text.split(' '); let lines = []; let currentLine = words[0];
    for (let i = 1; i < words.length; i++) {
        if (ctx.measureText(currentLine + " " + words[i]).width < maxWidth) currentLine += " " + words[i];
        else { lines.push(currentLine); currentLine = words[i]; }
    }
    lines.push(currentLine); return lines;
}

// ২. স্টোরি ইঞ্জিন ও আপনার সেই অমূল্য নিউরোমার্কেটিং কন্টেন্ট (হুবহু আছে)
async function fetchAndPlay(storyId, isDailyFree = false, isAutoLoad = false) {
    const story = allStories.find(s => String(s.id) === String(storyId));
    if (!story) return;
    currentStoryId = storyId; currentStoryTitle = story.title;

    // প্রিমিয়াম লজিক অডিট
    const isPremium = (story.is_premium === true || String(story.is_premium) === 'true');
    const isDaily = (isDailyFree === true || String(storyId) === String(dailyStoryId));
    const isPaid = (userStatus === 'paid');

    let canReadFull = true;
    if (isPremium && !isDaily && !isPaid) canReadFull = false;

    let isLocked = !canReadFull;
    let content = canReadFull ? story.content : story.content.substring(0, Math.floor(story.content.length * 0.2)) + "...";

    // আপনার নিউরোমার্কেটিং বক্স (কোনো পরিবর্তন নেই)
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

// ৩. ইনিশিয়ালাইজেশন ও অন্যান্য লজিক (অক্ষুণ্ণ)
window.handleSeriesChange = () => {
    const selectedSeries = document.getElementById('seriesSelect').value;
    const filtered = (selectedSeries === "All") ? allStories : allStories.filter(s => (s.series_name || 'একক গল্প') === selectedSeries);
    renderSidebar(filtered);
};
window.filterStories = () => {
    const term = document.getElementById('storySearch').value.toLowerCase();
    const filtered = allStories.filter(s => s.title.toLowerCase().includes(term));
    renderSidebar(filtered);
};
async function initApp() {
    let uuid = localStorage.getItem('device_uuid') || self.crypto.randomUUID();
    localStorage.setItem('device_uuid', uuid);
    if(document.getElementById('footerUid')) document.getElementById('footerUid').innerText = uuid;
    try {
        const { data: user } = await _supabase.from('users').select('status').eq('device_uuid', uuid).maybeSingle();
        if (user?.status === 'paid') userStatus = 'paid';
        const { data: stories } = await _supabase.from('stories').select('*').order('created_at', { ascending: true });
        if (stories) {
            allStories = stories; document.getElementById('totalCount').innerText = stories.length;
            const seriesSelect = document.getElementById('seriesSelect');
            const seriesList = [...new Set(stories.map(s => s.series_name || 'একক গল্প'))];
            seriesList.forEach(name => {
                const opt = document.createElement('option'); opt.value = name; opt.innerText = name; seriesSelect.appendChild(opt);
            });
            const urlParams = new URLSearchParams(window.location.search);
            const storyIdFromUrl = urlParams.get('story');
            if (storyIdFromUrl) fetchAndPlay(storyIdFromUrl, false, true); 
            else { dailyStoryId = stories[Math.floor(Date.now() / 86400000) % stories.length].id; fetchAndPlay(dailyStoryId, true, true); }
            renderSidebar(stories);
        }
    } catch (e) { console.error("Init Error", e); }
}
function renderSidebar(stories) {
    const list = document.getElementById('storyList'); list.innerHTML = '';
    const colors = ['#FFD1DC', '#D1F2EB', '#FFF4BD', '#E1F5FE'];
    stories.forEach((s, i) => {
        const div = document.createElement('div'); div.className = 'story-banner';
        div.style.backgroundColor = colors[i % colors.length];
        div.innerHTML = `${s.title}`; div.onclick = () => fetchAndPlay(s.id);
        list.appendChild(div);
    });
}
window.initPayment = () => window.location.assign(window.location.origin + '/payment.html');
window.toggleFullscreen = () => {
    const p = document.getElementById('playerArea');
    if (!document.fullscreenElement) p.requestFullscreen ? p.requestFullscreen() : p.webkitRequestFullscreen();
    else document.exitFullscreen();
};
document.addEventListener('DOMContentLoaded', initApp);
