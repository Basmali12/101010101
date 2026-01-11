// --- 1. Firebase Imports & Config ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyBAnDMYjA-nA6L_pmoujAEpziGjZRwLB94",
    authDomain: "basd-6ba8e.firebaseapp.com",
    projectId: "basd-6ba8e",
    storageBucket: "basd-6ba8e.firebasestorage.app",
    messagingSenderId: "51849051836",
    appId: "1:51849051836:web:fec1c006e9b869e59f1ab9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// --- 2. Dynamic Gallery Logic ---
async function loadProjects() {
    const galleryContainer = document.getElementById('gallery-container');
    
    try {
        // نطلب البيانات من مجموعة "projects" ونرتبها حسب التاريخ (الأحدث أولاً)
        // ملاحظة: بما أننا لم ننشئ البيانات بعد، هذه المصفوفة ستكون فارغة حالياً
        const q = query(collection(db, "projects"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        
        // مسح رسالة التحميل
        galleryContainer.innerHTML = '';

        if (querySnapshot.empty) {
            galleryContainer.innerHTML = `
                <p style="text-align:center; width:100%; color:#999; grid-column: 1 / -1;">
                    <span data-lang="en">No projects added yet.</span>
                    <span data-lang="ar">لم يتم إضافة مشاريع بعد.</span>
                </p>
            `;
            return;
        }

        // إنشاء بطاقة لكل مشروع
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            // الـ data هنا ستحتوي على imageUrl, title, description التي سنرسلها من لوحة التحكم
            
            const card = document.createElement('div');
            card.className = 'project-card gsap-fade-up';
            card.innerHTML = `
                <img src="${data.imageUrl}" alt="${data.title}" class="project-img">
                <div class="project-info">
                    <h3>${data.title}</h3>
                    <p>${data.description}</p>
                </div>
            `;
            galleryContainer.appendChild(card);
        });

        // إعادة تشغيل الأنيميشن للعناصر الجديدة
        setTimeout(() => ScrollTrigger.refresh(), 500);

    } catch (error) {
        console.error("Error fetching projects: ", error);
        // في حال حدوث خطأ (مثلاً المجموعة غير موجودة بعد) لن نظهر شيئاً مزعجاً للعميل
        galleryContainer.innerHTML = `
            <p style="text-align:center; width:100%; color:#999; grid-column: 1 / -1;">
                <span data-lang="en">Gallery will be updated soon.</span>
                <span data-lang="ar">سيتم تحديث المعرض قريباً.</span>
            </p>
        `;
    }
}

// استدعاء الدالة عند تحميل الصفحة
loadProjects();


// --- 3. Animations & UI Logic ---
gsap.registerPlugin(ScrollTrigger);

// Hero Animation
gsap.from(".gsap-hero", {
    duration: 1, y: 50, opacity: 0, stagger: 0.2, ease: "power3.out", delay: 0.5
});

// Services Cards Animation
gsap.utils.toArray(".gsap-card").forEach((card, i) => {
    gsap.from(card, {
        scrollTrigger: { trigger: card, start: "top 85%", toggleActions: "play none none reverse" },
        y: 50, opacity: 0, duration: 0.6, delay: i * 0.1
    });
});

// Fade Up General
gsap.utils.toArray(".gsap-fade-up").forEach(el => {
    gsap.from(el, {
        scrollTrigger: { trigger: el, start: "top 80%" },
        y: 30, opacity: 0, duration: 0.8
    });
});

// Bottom Nav Active State
const navItems = document.querySelectorAll('.nav-item');
navItems.forEach(item => {
    item.addEventListener('click', function() {
        navItems.forEach(nav => nav.classList.remove('active'));
        this.classList.add('active');
    });
});
