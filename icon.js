/**
 * icon.js - PoshuPakhiGolpo Icon Generator
 * লজিক: ক্যানভাস ব্যবহার করে ফেসলেস (চেহারা ছাড়া) রঙিন এনিমেল আইকন তৈরি করা।
 */

const PoshuPakhiIcon = {
    // নিউরোমার্কেটিং কালার প্যালেট
    colors: {
        primary: '#2E7D32',   // সবুজ (Trust)
        action: '#FF9800',    // কমলা (Energy)
        elephant: '#90B4CE',  // নীল
        bear: '#A67C52',      // ব্রাউন
        bg: '#F1F8E9'         // মিন্ট ব্যাকগ্রাউন্ড
    },

    /**
     * আইকন ড্রয়িং লজিক
     * @param {number} size - আইকনের সাইজ (px)
     */
    generate: function(size = 512) {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        const s = size / 100; // স্কেলিং ইউনিট

        // ১. ব্যাকগ্রাউন্ড (স্মুথ রাউন্ডেড কর্নার)
        ctx.fillStyle = this.colors.bg;
        ctx.beginPath();
        ctx.roundRect(0, 0, size, size, size * 0.2);
        ctx.fill();

        // ২. হাতি (Elephant - Faceless Silhouette)
        ctx.fillStyle = this.colors.elephant;
        ctx.beginPath();
        ctx.arc(45 * s, 65 * s, 22 * s, 0, Math.PI * 2); // বডি
        ctx.fill();
        // শুঁড় (Trunk)
        ctx.lineWidth = 7 * s;
        ctx.strokeStyle = this.colors.elephant;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(60 * s, 60 * s);
        ctx.quadraticCurveTo(85 * s, 50 * s, 75 * s, 85 * s);
        ctx.stroke();

        // ৩. ভাল্লুক (Bear - Faceless Silhouette)
        ctx.fillStyle = this.colors.bear;
        ctx.beginPath();
        ctx.arc(32 * s, 78 * s, 14 * s, 0, Math.PI * 2);
        ctx.fill();

        // ৪. পাখি (Bird - Action Colors)
        // ডানা (Wing)
        ctx.fillStyle = this.colors.action;
        ctx.beginPath();
        ctx.ellipse(68 * s, 38 * s, 18 * s, 9 * s, -Math.PI / 4, 0, Math.PI * 2);
        ctx.fill();
        // মাথা (Faceless Head)
        ctx.fillStyle = this.colors.primary;
        ctx.beginPath();
        ctx.arc(82 * s, 28 * s, 7 * s, 0, Math.PI * 2);
        ctx.fill();

        return canvas.toDataURL('image/png');
    },

    /**
     * ব্রাউজারের ফেভিকন (Favicon) হিসেবে সেট করা
     */
    setAsFavicon: function() {
        const url = this.generate(192);
        let link = document.querySelector("link[rel~='icon']");
        if (!link) {
            link = document.createElement('link');
            link.rel = 'icon';
            document.head.appendChild(link);
        }
        link.href = url;
    },

    /**
     * আইকনটি ডাউনলোড করার অপশন (PWA এসেট তৈরির জন্য)
     */
    download: function(size) {
        const link = document.createElement('a');
        link.download = `icon-${size}.png`;
        link.href = this.generate(size);
        link.click();
    }
};

// অটোমেটিক ফেভিকন সেট করা
document.addEventListener('DOMContentLoaded', () => {
    PoshuPakhiIcon.setAsFavicon();
});
