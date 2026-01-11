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

// --- 2. إعدادات Cloudinary ---
// تأكد أن هذا هو اسم الكلاود الصحيح من لوحة التحكم (Cloud Name)
const CLOUD_NAME = "dw9gnbmtd"; 
const UPLOAD_PRESET = "jkgjk8"; // اسم البريسيت من الصورة التي أرسلتها
const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

// --- 3. المنطق البرمجي ---

const publishBtn = document.getElementById('publish-btn');

publishBtn.addEventListener('click', async () => {
    const title = document.getElementById('project-title').value;
    const desc = document.getElementById('project-desc').value;
    const fileInput = document.getElementById('project-image');
    const statusMsg = document.getElementById('upload-status');

    if (!title || !fileInput.files[0]) {
        alert("⚠️ يرجى كتابة العنوان واختيار صورة!");
        return;
    }

    statusMsg.innerText = "جاري رفع الصورة... ⏳";
    statusMsg.style.color = "blue";
    publishBtn.disabled = true;

    try {
        // 1. رفع الصورة إلى Cloudinary
        const file = fileInput.files[0];
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', UPLOAD_PRESET);

        const response = await fetch(CLOUDINARY_URL, {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        // فحص إذا كان هناك خطأ من Cloudinary
        if (!response.ok) {
            console.error("Cloudinary Error:", data);
            throw new Error("خطأ في رفع الصورة: " + (data.error?.message || "تأكد من اسم الكلاود والبريسيت"));
        }

        const imageUrl = data.secure_url;
        console.log("Image Uploaded:", imageUrl);

        // 2. حفظ البيانات في Firebase
        statusMsg.innerText = "جاري حفظ البيانات... 💾";
        
        await addDoc(collection(db, "projects"), {
            title: title,
            description: desc,
            imageUrl: imageUrl,
            createdAt: serverTimestamp()
        });

        // 3. نجاح
        statusMsg.innerText = "تم النشر بنجاح! ✅";
        statusMsg.style.color = "green";
        
        // تنظيف الحقول
        document.getElementById('project-title').value = "";
        document.getElementById('project-desc').value = "";
        fileInput.value = "";
        publishBtn.disabled = false;

        setTimeout(() => statusMsg.innerText = "", 3000);

    } catch (error) {
        console.error("Full Error:", error);
        
        // عرض رسالة الخطأ الحقيقية للمستخدم
        let userMessage = "حدث خطأ غير معروف!";
        
        if (error.message.includes("خطأ في رفع الصورة")) {
            userMessage = error.message;
        } else if (error.message.includes("Missing or insufficient permissions")) {
            userMessage = "خطأ في الصلاحيات (Firebase Rules)! تأكد من تعديل القواعد إلى true.";
        } else {
            userMessage = "خطأ تقني: " + error.message;
        }

        statusMsg.innerText = userMessage;
        statusMsg.style.color = "red";
        alert("❌ " + userMessage); // رسالة منبثقة لتراها بوضوح
        publishBtn.disabled = false;
    }
});

// --- 4. عرض المشاريع وحذفها ---
const projectsList = document.getElementById('projects-list');
const q = query(collection(db, "projects"), orderBy("createdAt", "desc"));

onSnapshot(q, (snapshot) => {
    projectsList.innerHTML = ""; 

    if (snapshot.empty) {
        projectsList.innerHTML = "<p style='text-align:center'>لا توجد مشاريع حالياً.</p>";
    }

    snapshot.forEach((docSnapshot) => {
        const project = docSnapshot.data();
        const id = docSnapshot.id;

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

window.deleteProject = async function(id) {
    if(confirm("هل أنت متأكد من حذف هذا المشروع؟")) {
        try {
            await deleteDoc(doc(db, "projects", id));
        } catch (error) {
            console.error("Delete Error:", error);
            alert("حدث خطأ أثناء الحذف: " + error.message);
        }
    }
}
