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

// --- دالة مساعدة: تحويل رابط الصورة ليكون بحجم ثابت ---
function getFixedSizeImageUrl(originalUrl) {
    // نتأكد أن الرابط من كلاوديناري
    if (!originalUrl || !originalUrl.includes("cloudinary.com")) {
        return originalUrl;
    }
    // نقوم بحقن أوامر القص (Crop) في الرابط
    // c_fill: قص احترافي يملأ المساحة
    // w_400,h_300: عرض 400 وارتفاع 300 (نسبة 4:3 ممتازة)
    // q_auto,f_auto: تحسين الجودة والحجم تلقائياً
    return originalUrl.replace("/upload/", "/upload/c_fill,w_400,h_300,q_auto,f_auto/");
}


// --- 2. Dynamic Gallery Logic ---
async function loadProjects() {
    const galleryContainer = document.getElementById('gallery-container');
    
    try {
        // ترتيب تنازلي حسب تاريخ الإنشاء
        const q = query(collection(db, "projects"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        
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

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            
            // ⭐ هنا نستخدم الدالة الجديدة للحصول على الرابط المقصوص ⭐
            const fixedUrl = getFixedSizeImageUrl(data.imageUrl);

            const card = document.createElement('div');
            card.className = 'project-card gsap-fade-up';
            // نستخدم fixedUrl بدلاً من data.imageUrl
            card.innerHTML = `
                <img src="${fixedUrl}" alt="${data.title}" class="project-img">
                <div class="project-info">
                    <h3>${data.title}</h3>
                    <p>${data.description}</p>
                </div>
            `;
            galleryContainer.appendChild(card);
        });

        // تحديث الأنيميشن
        setTimeout(() => ScrollTrigger.refresh(), 500);
        // تحديث اللغة للعناصر الجديدة
        if (document.documentElement.lang === 'ar') {
            document.body.classList.add('rtl');
        }


    } catch (error) {
        console.error("Error fetching projects: ", error);
        galleryContainer.innerHTML = `
            <p style="text-align:center; width:100%; color:#999; grid-column: 1 / -1;">
                <span data-lang="en">Could not load projects.</span>
                <span data-lang="ar">تعذر تحميل المشاريع حالياً.</span>
            </p>
        `;
    }
}

loadProjects();


// --- 3. Animations & UI Logic ---
gsap.registerPlugin(ScrollTrigger);
// (بقية كود الأنيميشن كما هو بدون تغيير)
gsap.from(".gsap-hero", { duration: 1, y: 50, opacity: 0, stagger: 0.2, ease: "power3.out", delay: 0.5 });
gsap.utils.toArray(".gsap-card").forEach((card, i) => {
    gsap.from(card, { scrollTrigger: { trigger: card, start: "top 85%", toggleActions: "play none none reverse" }, y: 50, opacity: 0, duration: 0.6, delay: i * 0.1 });
});
gsap.utils.toArray(".gsap-fade-up").forEach(el => {
    gsap.from(el, { scrollTrigger: { trigger: el, start: "top 80%" }, y: 30, opacity: 0, duration: 0.8 });
});
const navItems = document.querySelectorAll('.nav-item');
navItems.forEach(item => {
    item.addEventListener('click', function() {
        navItems.forEach(nav => nav.classList.remove('active'));
        this.classList.add('active');
    });
});
