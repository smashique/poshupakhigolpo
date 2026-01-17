/* --- style.css - Manual & Auto-Scroll Enabled --- */

@import url('https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@300;400;600;700&display=swap');

:root {
    --primary-green: #2E7D32;
    --bg-light: #F1F8E9;
    --text-main: #263238;
}

body { margin: 0; font-family: 'Hind Siliguri', sans-serif; background-color: var(--bg-light); color: var(--text-main); line-height: 1.5; }

.navbar { padding: 10px 20px; background: white; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 2px 10px rgba(0,0,0,0.03); position: sticky; top: 0; z-index: 1000; }
.logo-text { font-weight: 700; color: var(--primary-green); font-size: 1.25rem; cursor: pointer; }

.container { display: grid; grid-template-columns: 1fr 340px; gap: 20px; max-width: 1350px; margin: 15px auto; padding: 0 15px; }

.player-container {
    position: relative;
    width: 100%;
    height: 402px; 
    background: white;
    border-radius: 35px;
    border: 8px solid white;
    box-shadow: 0 10px 30px rgba(0,0,0,0.05);
    overflow: hidden;
}

.lock-overlay {
    position: absolute;
    top: 0; left: 0; width: 100%; height: 100%;
    background: rgba(255, 255, 255, 0.95);
    z-index: 100;
    display: flex; align-items: center; justify-content: center; text-align: center;
}

.lock-content h2 { color: var(--text-main); margin-bottom: 20px; padding: 0 15px; }
.btn-unlock { background: var(--primary-green); color: white; border: none; padding: 12px 30px; border-radius: 50px; cursor: pointer; font-weight: 700; font-size: 1.1rem; }

#storyFrame { width: 100%; height: 100%; border: none; }

.sidebar { 
    background: white; 
    border-radius: 35px; 
    padding: 20px; 
    height: 402px; 
    display: flex; flex-direction: column; 
    box-shadow: 0 10px 30px rgba(0,0,0,0.05); 
    box-sizing: border-box;
}

.thumbnail-list { 
    flex-grow: 1; 
    overflow-y: auto; /* 'hidden' theke 'auto' kora hoyeche manual scroll er jonno */
    display: flex; flex-direction: column; gap: 10px; 
    scroll-behavior: smooth;
    scrollbar-width: none; /* Scrollbar hide rakha hoyeche clean look er jonno */
}

.thumbnail-list::-webkit-scrollbar { display: none; }

.story-banner { min-height: 55px; border-radius: 15px; display: flex; align-items: center; justify-content: center; padding: 10px; cursor: pointer; font-weight: 700; text-align: center; font-size: 0.95rem; }

.fomo-badge { background: #E8F5E9; padding: 8px 15px; border-radius: 50px; font-size: 0.85rem; font-weight: 600; color: var(--primary-green); }
.btn-install { background: var(--primary-green); color: white; border: none; padding: 8px 15px; border-radius: 50px; cursor: pointer; font-weight: 600; margin: 5px; }

.premium-banner { 
    grid-column: 1 / -1; 
    background: white; border-radius: 30px; padding: 20px; 
    box-shadow: 0 10px 30px rgba(0,0,0,0.05);
}

.hidden { display: none !important; }

@media (max-width: 1000px) {
    .container { grid-template-columns: 1fr; }
    .player-container, .sidebar { height: 380px; }
}
