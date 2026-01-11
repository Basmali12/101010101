// --- 1. إعدادات فايربيس ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, deleteDoc, doc, onSnapshot, query, orderBy, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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

// --- 2. إعدادات Cloudinary (الصحيحة والجديدة) ---
const CLOUD_NAME = "dw9gnbmtd"; 
const UPLOAD_PRESET = "wwwewe"; // <--- البريسيت الجديد الذي نجح معك
const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

// --- 3. منطق النشر (Publish Logic) ---
const publishBtn = document.getElementById('publish-btn');

publishBtn.addEventListener('click', async () => {
    const title = document.getElementById('project-title').value;
    const desc = document.getElementById('project-desc').value;
    const fileInput = document.getElementById('project-image');
    const statusMsg = document.getElementById('upload-status');

    if (!title || !fileInput.files[0]) {
        alert("يرجى كتابة العنوان واختيار صورة!");
        return;
    }

    // إظهار رسالة التحميل
    statusMsg.innerText = "جاري رفع الصورة... ⏳";
    statusMsg.style.color = "blue";
    publishBtn.disabled = true;

    try {
        // أ) رفع الصورة إلى Cloudinary
        const file = fileInput.files[0];
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', UPLOAD_PRESET);

        const response = await fetch(CLOUDINARY_URL, {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error?.message || "فشل رفع الصورة");
        }

        const imageUrl = data.secure_url;
        console.log("Image Uploaded:", imageUrl);

        // ب) حفظ البيانات في Firebase
        statusMsg.innerText = "جاري حفظ البيانات في قاعدة البيانات... 💾";
        
        await addDoc(collection(db, "projects"), {
            title: title,
            description: desc,
            imageUrl: imageUrl,
            createdAt: serverTimestamp() // لتظهر الأحدث أولاً
        });

        // ج) إتمام العملية
        statusMsg.innerText = "تم النشر بنجاح! ✅";
        statusMsg.style.color = "green";
        
        // تنظيف الحقول
        document.getElementById('project-title').value = "";
        document.getElementById('project-desc').value = "";
        fileInput.value = "";
        publishBtn.disabled = false;

        setTimeout(() => statusMsg.innerText = "", 3000);

    } catch (error) {
        console.error("Error:", error);
        statusMsg.innerText = "حدث خطأ: " + error.message;
        statusMsg.style.color = "red";
        alert("❌ حدث خطأ: " + error.message);
        publishBtn.disabled = false;
    }
});

// --- 4. عرض المشاريع وحذفها (Real-time) ---
const projectsList = document.getElementById('projects-list');
const q = query(collection(db, "projects"), orderBy("createdAt", "desc"));

onSnapshot(q, (snapshot) => {
    projectsList.innerHTML = ""; // مسح القائمة

    if (snapshot.empty) {
        projectsList.innerHTML = "<p style='text-align:center; padding:10px;'>لا توجد مشاريع مضافة حالياً.</p>";
    }

    snapshot.forEach((docSnapshot) => {
        const project = docSnapshot.data();
        const id = docSnapshot.id;

        const item = document.createElement('div');
        item.className = 'admin-project-card';
        item.innerHTML = `
            <img src="${project.imageUrl}" class="admin-img-thumb" alt="project">
            <div class="admin-card-info">
                <h5>${project.title}</h5>
                <p>${project.description ? project.description.substring(0, 40) + '...' : ''}</p>
            </div>
            <button class="btn-delete" onclick="deleteProject('${id}')">
                <i class="fa-solid fa-trash"></i>
            </button>
        `;
        projectsList.appendChild(item);
    });
});

// دالة الحذف
window.deleteProject = async function(id) {
    if(confirm("هل أنت متأكد من حذف هذا المشروع نهائياً؟")) {
        try {
            await deleteDoc(doc(db, "projects", id));
            // لا نحتاج لرسالة نجاح لأن القائمة ستحدث نفسها تلقائياً
        } catch (error) {
            alert("فشل الحذف: " + error.message);
        }
    }
}
