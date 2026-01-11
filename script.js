// Language Toggle Logic
let currentLang = 'en';

function toggleLanguage() {
    currentLang = currentLang === 'en' ? 'ar' : 'en';
    
    // Toggle Body Class for RTL/Fonts
    if(currentLang === 'ar') {
        document.body.classList.add('rtl');
        document.documentElement.lang = 'ar';
    } else {
        document.body.classList.remove('rtl');
        document.documentElement.lang = 'en';
    }
    
    // Refresh ScrollTrigger because layout changed
    setTimeout(() => {
        ScrollTrigger.refresh();
    }, 100);
}

// Active Link Handling for Bottom Nav
const navItems = document.querySelectorAll('.nav-item');
navItems.forEach(item => {
    item.addEventListener('click', function() {
        navItems.forEach(nav => nav.classList.remove('active'));
        this.classList.add('active');
    });
});

// GSAP Animations
gsap.registerPlugin(ScrollTrigger);

// Hero Animation (On Load)
gsap.from(".gsap-hero", {
    duration: 1,
    y: 50,
    opacity: 0,
    stagger: 0.2,
    ease: "power3.out",
    delay: 0.5
});

// Services Cards Animation (On Scroll)
gsap.utils.toArray(".gsap-card").forEach((card, i) => {
    gsap.from(card, {
        scrollTrigger: {
            trigger: card,
            start: "top 85%",
            toggleActions: "play none none reverse"
        },
        y: 50,
        opacity: 0,
        duration: 0.6,
        delay: i * 0.1
    });
});

// Fade Up General Elements
gsap.utils.toArray(".gsap-fade-up").forEach(el => {
    gsap.from(el, {
        scrollTrigger: {
            trigger: el,
            start: "top 80%"
        },
        y: 30,
        opacity: 0,
        duration: 0.8
    });
});

// Scale Up Industry Tags
gsap.utils.toArray(".gsap-scale").forEach((el, i) => {
    gsap.from(el, {
        scrollTrigger: {
            trigger: el,
            start: "top 90%"
        },
        scale: 0.5,
        opacity: 0,
        duration: 0.5,
        delay: i * 0.1
    });
});
