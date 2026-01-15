const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseKey = 'YOUR_SUPABASE_KEY';
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

let currentStory = null;
let currentLang = 'bn';

// 1. UUID & User Identification
function getDeviceId() {
    let uuid = localStorage.getItem('device_uuid');
    if (!uuid) {
        uuid = crypto.randomUUID();
        localStorage.setItem('device_uuid', uuid);
        // Register user in Supabase
        supabase.from('users').insert([{ device_uuid: uuid }]).then();
    }
    return uuid;
}

// 2. Fixed Daily Story Logic
async function loadDailyStory() {
    const today = new Date().toISOString().split('T')[0];
    const seed = today.replace(/-/g, ''); // e.g. 20260115
    
    const { data: allStories } = await supabase.from('stories').select('*');
    if (allStories) {
        const index = parseInt(seed) % allStories.length;
        renderStory(allStories[index]);
        loadSidebar(allStories);
    }
}

// 3. Render Story with Language Toggle
function renderStory(story) {
    currentStory = story;
    const title = document.getElementById('storyTitle');
    const body = document.getElementById('storyBody');
    
    title.innerText = currentLang === 'bn' ? story.title_bn : story.title_en;
    body.innerText = currentLang === 'bn' ? story.content_bn : story.content_en;
}

function toggleLang(lang) {
    currentLang = lang;
    document.getElementById('btnBn').classList.toggle('active', lang === 'bn');
    document.getElementById('btnEn').classList.toggle('active', lang === 'en');
    if (currentStory) renderStory(currentStory);
}

// 4. Protection Logic (Copy & Screenshot prevention attempt)
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && (e.key === 'c' || e.key === 'u' || e.key === 's')) {
        e.preventDefault();
        alert('কপি করা নিষেধ!');
    }
});

// Initialize
getDeviceId();
loadDailyStory();
