/* --- PoshuPakhi Golpo - Series Engine v31.2 --- */
const SUPABASE_URL = 'https://xptwwlrcygimfislsutz.supabase.co'.trim(); 
const SUPABASE_ANON_KEY = 'sb_publishable_N0YqY-tMEW_KWxFdS7zgVA_3CgR8Go-'.trim();
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let userStatus = 'free'; 
let dailyStoryId = null;
let currentStoryTitle = "";
let allStories = []; 

async function initApp() {
    let uuid = localStorage.getItem('device_uuid') || self.crypto.randomUUID();
    localStorage.setItem('device_uuid', uuid);
    if(document.getElementById('footerUid')) document.getElementById('footerUid').innerText = uuid;

    try {
        const { count: paidCount } = await _supabase.from('users').select('*', { count: 'exact', head: true }).eq('status', 'paid');
        if(paidCount && document.getElementById('paidCount')) document.getElementById('paidCount').innerText = paidCount;
        
        const { data: user } = await _supabase.from('users').select('status').eq('device_uuid', uuid).maybeSingle();
        if (user?.status === 'paid') userStatus = 'paid';

        // series_name কলামটি ডাটাবেজ থেকে নিয়ে আসা হচ্ছে
        const { data: stories } = await _supabase.from('stories').select('id, title, series_name, content').order('created_at', { ascending: true });
        if (stories) {
            allStories = stories;
            if(document.getElementById('totalCount')) document.getElementById('totalCount').innerText = stories.length;
            
            renderSeriesDropdown(stories); // সিরিজের ড্রপডাউন তৈরি
            dailyStoryId = stories[Math.floor(Date.now() / 86400000) % stories.length].id;
            fetchAndPlay(dailyStoryId, true, true);
            renderSidebar(stories);
        }
    } catch (e) { console.error("Init Error", e); }
}

// সিরিজের ইউনিক তালিকা তৈরি করার ফাংশন
function renderSeriesDropdown(stories) {
    const select = document.getElementById('seriesSelect');
    if(!select) return;
    const series = [...new Set(stories.map(s => s.series_name || 'একক গল্প'))];
    series.forEach(name => {
        const opt = document.createElement('option');
        opt.value = name;
        opt.innerText = name;
        select.appendChild(opt);
    });
}

// সিরিজ এবং সার্চ অনুযায়ী গল্প ফিল্টার করার লজিক
function filterBySeries() {
    const selectedSeries = document.getElementById('seriesSelect').value;
    const searchTerm = document.getElementById('storySearch').value.toLowerCase();
    
    let filtered = allStories;
    if(selectedSeries !== "All") {
        filtered = filtered.filter(s => (s.series_name || 'একক গল্প') === selectedSeries);
    }
    if(searchTerm) {
        filtered = filtered.filter(s => s.title.toLowerCase().includes(searchTerm));
    }
    renderSidebar(filtered);
}

function filterStories() {
    filterBySeries(); // সার্চ করলেও যাতে সিরিজের ফিল্টার ঠিক থাকে
}

// ... (playPopSound, updateStorySEO, shareApp, toggleFullscreen, fetchAndPlay functions remain same) ...
document.addEventListener('DOMContentLoaded', initApp);
