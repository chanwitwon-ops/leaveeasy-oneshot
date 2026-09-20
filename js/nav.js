// ─────────────────────────────────────────────────────────────
// js/nav.js — แถบเมนูด้านบนที่ใช้ร่วมกันทุกหน้า
// แก้เมนูที่ไฟล์นี้ที่เดียว ทุกหน้าเปลี่ยนตามพร้อมกัน
//
// วิธีใช้: ทุกหน้ามี <div id="nav"></div> ไว้บนสุดของ body
//
// ตั้งแต่สัปดาห์ที่ 7 ไฟล์นี้ยังทำหน้าที่เป็น "ยามหน้าประตู" ด้วย:
// - ถ้าหน้านั้นโหลด Firebase SDK มา (ตรวจจาก window.firebase) จะเช็ค
//   สถานะล็อกอิน แล้วเด้งไป login.html ถ้ายังไม่ได้ล็อกอิน
// - หน้าที่ไม่โหลด Firebase (เช่น index.html) จะไม่ถูกบังคับล็อกอิน
// - เก็บผู้ใช้ปัจจุบันไว้ที่ window.currentUser และ window.currentUserPromise
//   ให้ไฟล์ js ของหน้าอื่น ๆ (leave-requests.js ฯลฯ) รอใช้ต่อได้ เช่น
//   window.currentUserPromise.then(function (user) { ... })
// ─────────────────────────────────────────────────────────────

(function () {
  var เมนู = [
    { href: "index.html",             ชื่อ: "หน้าแรก" },
    { href: "leave-requests.html",    ชื่อ: "รายการใบลา" },
    { href: "new-leave-request.html", ชื่อ: "ยื่นใบลาใหม่" },
    { href: "leave-types.html",       ชื่อ: "ประเภทการลา" }
  ];

  // ชื่อไฟล์ของหน้าที่กำลังเปิดอยู่ เอาไว้ขีดเส้นใต้เมนูที่ตรงกัน
  var หน้าปัจจุบัน = location.pathname.split("/").pop() || "index.html";

  // หน้าที่เปิดได้โดยไม่ต้องล็อกอิน (เป็นหน้ารวมลิงก์ ไม่มีข้อมูลจาก Firestore)
  var หน้าสาธารณะ = ["index.html"];

  var html = '<div class="navbar"><span class="brand">🔧 LeaveEasy</span>';
  เมนู.forEach(function (m) {
    var active = m.href === หน้าปัจจุบัน ? ' class="active"' : "";
    html += '<a href="' + m.href + '"' + active + ">" + m.ชื่อ + "</a>";
  });
  // ช่องแสดงชื่อ/บทบาทของคนที่ล็อกอินอยู่ + ปุ่มออกจากระบบ
  html += '<span class="nav-user" id="navUser"></span></div>';

  var ที่วาง = document.getElementById("nav");
  if (ที่วาง) ที่วาง.innerHTML = html;

  var บทบาทภาษาไทย = { employee: "ผู้ขอลา", manager: "ผู้อนุมัติ", hr: "ฝ่ายบุคคล" };

  function หนีเข้าหน้าล็อกอิน() {
    if (หน้าสาธารณะ.indexOf(หน้าปัจจุบัน) === -1) {
      location.href = "login.html";
    }
  }

  function แสดงผู้ใช้(user) {
    var กล่อง = document.getElementById("navUser");
    if (!กล่อง) return;
    var ชื่อบทบาท = บทบาทภาษาไทย[user.role] || user.role || "";
    กล่อง.innerHTML =
      "<span>" + esc(user.name || user.email) + (ชื่อบทบาท ? " (" + esc(ชื่อบทบาท) + ")" : "") + "</span> " +
      '<button type="button" id="logout-btn" class="btn-ghost" style="padding:4px 12px;font-size:14px;">ออกจากระบบ</button>';

    document.getElementById("logout-btn").addEventListener("click", function () {
      firebase.auth().signOut().then(function () {
        location.href = "login.html";
      });
    });
  }

  // หน้าที่ไม่ได้โหลด Firebase SDK (เช่น index.html) ให้ข้ามการตรวจล็อกอินไปเลย
  if (typeof firebase === "undefined" || !firebase.apps || !firebase.apps.length) {
    window.currentUserPromise = Promise.resolve(null);
    return;
  }

  window.currentUserPromise = new Promise(function (resolve) {
    firebase.auth().onAuthStateChanged(function (user) {
      if (!user) {
        window.currentUser = null;
        หนีเข้าหน้าล็อกอิน();
        resolve(null);
        return;
      }

      firebase.firestore().collection("users").doc(user.uid).get().then(function (doc) {
        var โปรไฟล์ = doc.exists ? doc.data() : { name: user.email, email: user.email, role: "employee" };
        var currentUser = {
          uid: user.uid,
          name: โปรไฟล์.name,
          email: โปรไฟล์.email,
          role: โปรไฟล์.role
        };
        window.currentUser = currentUser;
        แสดงผู้ใช้(currentUser);
        resolve(currentUser);
      }).catch(function (err) {
        console.error("โหลดข้อมูลผู้ใช้จาก users/{uid} ไม่สำเร็จ", err);
        resolve(null);
      });
    });
  });
})();

// แถบเตือนสีเหลือง ใช้ตอนที่ยังไม่ได้ตั้งค่า Firebase
function showConfigWarning(ข้อความ) {
  var กล่อง = document.createElement("div");
  กล่อง.className = "alert alert-warn";
  กล่อง.innerHTML =
    "⚠️ <strong>ยังไม่ได้ตั้งค่า Firebase</strong> — " +
    (ข้อความ || "หน้านี้จึงยังไม่ได้อ่านข้อมูลจากฐานข้อมูลจริง") +
    "<br>วิธีตั้งค่าอยู่ในไฟล์ js/firebase-config.example.js";
  var ที่วาง = document.querySelector(".container") || document.body;
  ที่วาง.insertBefore(กล่อง, ที่วาง.firstChild);
}
