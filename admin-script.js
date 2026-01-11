// --- 1. إعدادات فايربيس (نفس التي لديك) ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, onSnapshot, query, orderBy, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyBAnDMYjA-nA6L_pmoujAEpziGjZRwLB94",
    authDomain: "basd-6ba8e.firebaseapp.com",
    projectId: "basd-6ba8e",
    storageBucket: "basd-6ba8e.firebasestorage.app",
    messagingSenderId: "51849051836",
    appId: "1:51849051836:web:fec1c006e9b869e59f1ab9"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// --- 2. إعدادات Cloudinary ---
const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dw9gnbmtd/image/upload";
const UPLOAD_PRESET = "jkgjk8";

// --- 3. المنطق البرمجي ---

// زر النشر
const publishBtn = document.getElementById('publish-btn');

publishBtn.addEventListener('click', async () => {
    const title = document.getElementById('project-title').value;
    const desc = document.getElementById('project-desc').value;
    const fileInput = document.getElementById('project-image');
    const statusMsg = document.getElementById('upload-status');

    // تحقق من المدخلات
    if (!title || !fileInput.files[0]) {
        alert("يرجى كتابة العنوان واختيار صورة!");
        return;
    }

    // 1. بدء الرفع
    statusMsg.innerText = "جاري رفع الصورة... ⏳";
    statusMsg.style.color = "blue";
    publishBtn.disabled = true;

    try {
        // تجهيز ملف الصورة للرفع
        const file = fileInput.files[0];
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', UPLOAD_PRESET);

        // رفع إلى Cloudinary
        const response = await fetch(CLOUDINARY_URL, {
            method: 'POST',
            body: formData
        });
        const data = await response.json();
        const imageUrl = data.secure_url; // رابط الصورة الجاهز

        // 2. حفظ البيانات في Firebase
        statusMsg.innerText = "جاري حفظ البيانات... 💾";
        
        await addDoc(collection(db, "projects"), {
            title: title,
            description: desc,
            imageUrl: imageUrl,
            createdAt: serverTimestamp() // لتظهر الأحدث أولاً
        });

        // 3. نجاح
        statusMsg.innerText = "تم النشر بنجاح! ✅";
        statusMsg.style.color = "green";
        
        // تنظيف الحقول
        document.getElementById('project-title').value = "";
        document.getElementById('project-desc').value = "";
        fileInput.value = "";
        publishBtn.disabled = false;

        // إخفاء رسالة النجاح بعد 3 ثواني
        setTimeout(() => statusMsg.innerText = "", 3000);

    } catch (error) {
        console.error("Error:", error);
        statusMsg.innerText = "حدث خطأ! حاول مرة أخرى ❌";
        statusMsg.style.color = "red";
        publishBtn.disabled = false;
    }
});

// --- 4. عرض المشاريع وحذفها (Real-time) ---
const projectsList = document.getElementById('projects-list');

// الاستماع لأي تغيير في قاعدة البيانات
const q = query(collection(db, "projects"), orderBy("createdAt", "desc"));

onSnapshot(q, (snapshot) => {
    projectsList.innerHTML = ""; // مسح القائمة الحالية

    if (snapshot.empty) {
        projectsList.innerHTML = "<p style='text-align:center'>لا توجد مشاريع حالياً.</p>";
    }

    snapshot.forEach((docSnapshot) => {
        const project = docSnapshot.data();
        const id = docSnapshot.id;

        // إنشاء عنصر القائمة
        const item = document.createElement('div');
        item.className = 'admin-project-card';
        item.innerHTML = `
            <img src="${project.imageUrl}" class="admin-img-thumb">
            <div class="admin-card-info">
                <h5>${project.title}</h5>
                <p>${project.description ? project.description.substring(0, 30) + '...' : ''}</p>
            </div>
            <button class="btn-delete" onclick="deleteProject('${id}')">
                <i class="fa-solid fa-trash"></i>
            </button>
        `;
        projectsList.appendChild(item);
    });
});

// دالة الحذف (يجب ربطها بالـ Window لأننا نستخدم Type Module)
window.deleteProject = async function(id) {
    if(confirm("هل أنت متأكد من حذف هذا المشروع؟")) {
        try {
            await deleteDoc(doc(db, "projects", id));
            // لا نحتاج لتحديث الواجهة يدوياً، onSnapshot ستقوم بذلك
        } catch (error) {
            console.error("Error deleting:", error);
            alert("حدث خطأ أثناء الحذف");
        }
    }
}
