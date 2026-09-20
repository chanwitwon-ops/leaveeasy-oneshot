// ─────────────────────────────────────────────────────────────
// js/firebase-config.example.js — ต้นแบบการตั้งค่า Firebase
//
// ไฟล์นี้ไม่มีคีย์จริง จึง commit ขึ้น GitHub ได้อย่างปลอดภัย
// ไฟล์จริงคือ js/firebase-config.js ซึ่งถูกกันไว้ใน .gitignore แล้ว
//
// ═══════════════ วิธีตั้งค่า (ทำครั้งเดียว) ═══════════════
// 1. คัดลอกไฟล์นี้ในโฟลเดอร์ js/ แล้วเปลี่ยนชื่อสำเนาเป็น "firebase-config.js"
//
// 2. เปิด Firebase Console → https://console.firebase.google.com/
//    → เลือกโปรเจกต์ "leaveeasy-oneshot" (ต้องตรงกับ .firebaserc)
//
// 3. เปิดใช้งาน 2 บริการนี้ก่อน (เมนูซ้าย → Build):
//    - Authentication → Get started → เลือกวิธี "Email/Password" → เปิดใช้งาน (Enable)
//    - Firestore Database → Create database → เลือก "Start in production mode"
//      (โหมด production ปลอดภัยกว่า แล้วค่อยวาง firestore.rules ทับ)
//
// 4. กดรูปเฟือง ⚙️ มุมซ้ายบน (ข้าง "Project Overview") → "Project settings"
//    → เลื่อนลงมาที่หัวข้อ "Your apps"
//    → ถ้ายังไม่มีเว็บแอป ให้กดไอคอน "</>" (Add app → Web)
//      ตั้งชื่อเล่นอะไรก็ได้ เช่น "leaveeasy-web" แล้วกด "Register app"
//      (ไม่ต้องติ๊ก Firebase Hosting ในขั้นตอนนี้ก็ได้)
//    → จะเห็นก้อนโค้ดที่มีตัวแปร firebaseConfig
//    → คัดลอกค่าทั้งหมดมาแทนที่ค่าใน object ด้านล่างนี้
//
// 5. บันทึกไฟล์ js/firebase-config.js แล้วเปิดหน้าเว็บใหม่
// ══════════════════════════════════════════════════════════

const firebaseConfig = {
  apiKey: "วางค่า apiKey ของคุณที่นี่",
  authDomain: "leaveeasy-oneshot.firebaseapp.com",
  projectId: "leaveeasy-oneshot",
  storageBucket: "leaveeasy-oneshot.appspot.com",
  messagingSenderId: "วางค่า messagingSenderId ของคุณที่นี่",
  appId: "วางค่า appId ของคุณที่นี่"
};

// เริ่มต้นการเชื่อมต่อ Firebase (ต้องโหลดสคริปต์ firebase-app-compat.js,
// firebase-auth-compat.js, firebase-firestore-compat.js มาก่อนไฟล์นี้เสมอ)
firebase.initializeApp(firebaseConfig);

// ตัวแปรกลางที่ไฟล์ js อื่น ๆ ในระบบเรียกใช้ได้ทันที
// db   = ตัวเชื่อมต่อ Firestore (ฐานข้อมูล)
// auth = ตัวเชื่อมต่อ Firebase Authentication (ระบบล็อกอิน)
const db = firebase.firestore();
const auth = firebase.auth();
