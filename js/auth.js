// ─────────────────────────────────────────────────────────────
// js/auth.js — ระบบเข้าสู่ระบบและสมัครสมาชิก (Firebase Authentication)
//
// ต้องโหลด firebase-app-compat.js, firebase-auth-compat.js,
// firebase-firestore-compat.js และ js/firebase-config.js (ที่สร้าง
// ตัวแปร auth และ db ไว้) มาก่อนไฟล์นี้เสมอ — ดู login.html/register.html
// ─────────────────────────────────────────────────────────────

// แปลรหัส error ของ Firebase Auth เป็นข้อความไทยที่อ่านเข้าใจง่าย
function แปลข้อผิดพลาดAuth(error) {
  var รหัส = error && error.code;
  var ข้อความ = {
    "auth/invalid-email": "รูปแบบอีเมลไม่ถูกต้อง",
    "auth/user-not-found": "ไม่พบบัญชีผู้ใช้นี้ในระบบ",
    "auth/wrong-password": "อีเมลหรือรหัสผ่านไม่ถูกต้อง",
    "auth/invalid-credential": "อีเมลหรือรหัสผ่านไม่ถูกต้อง",
    "auth/user-disabled": "บัญชีนี้ถูกระงับการใช้งาน",
    "auth/too-many-requests": "ลองเข้าสู่ระบบผิดหลายครั้งเกินไป กรุณาลองใหม่ภายหลัง",
    "auth/email-already-in-use": "อีเมลนี้ถูกใช้สมัครสมาชิกไปแล้ว",
    "auth/weak-password": "รหัสผ่านสั้นเกินไป ต้องมีอย่างน้อย 6 ตัวอักษร"
  };
  return (รหัส && ข้อความ[รหัส]) || (error && error.message) || "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง";
}

// ========== หน้าเข้าสู่ระบบ (login.html) ==========
if (document.getElementById("login-form")) {
  var loginForm = document.getElementById("login-form");
  var loginError = document.getElementById("login-error");
  var loginSubmitBtn = document.getElementById("login-submit-btn");

  loginForm.addEventListener("submit", function (e) {
    e.preventDefault();
    loginError.classList.add("hidden");
    loginSubmitBtn.disabled = true;

    var email = document.getElementById("email").value.trim();
    var password = document.getElementById("password").value;

    auth.signInWithEmailAndPassword(email, password)
      .then(function () {
        location.href = "leave-requests.html";
      })
      .catch(function (error) {
        loginError.textContent = "⚠️ " + แปลข้อผิดพลาดAuth(error);
        loginError.classList.remove("hidden");
        loginSubmitBtn.disabled = false;
      });
  });
}

// ========== หน้าสมัครสมาชิก (register.html) ==========
if (document.getElementById("register-form")) {
  var registerForm = document.getElementById("register-form");
  var registerError = document.getElementById("register-error");
  var registerSuccess = document.getElementById("register-success");
  var registerSubmitBtn = document.getElementById("register-submit-btn");

  registerForm.addEventListener("submit", function (e) {
    e.preventDefault();
    registerError.classList.add("hidden");
    registerSuccess.classList.add("hidden");
    registerSubmitBtn.disabled = true;

    var name = document.getElementById("name").value.trim();
    var email = document.getElementById("reg-email").value.trim();
    var password = document.getElementById("reg-password").value;
    var confirmPassword = document.getElementById("confirm-password").value;

    if (!name || !email || !password) {
      registerError.textContent = "⚠️ กรอกข้อมูลให้ครบทุกช่อง";
      registerError.classList.remove("hidden");
      registerSubmitBtn.disabled = false;
      return;
    }

    if (password !== confirmPassword) {
      registerError.textContent = "⚠️ รหัสผ่านไม่ตรงกัน";
      registerError.classList.remove("hidden");
      registerSubmitBtn.disabled = false;
      return;
    }

    if (password.length < 6) {
      registerError.textContent = "⚠️ รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร";
      registerError.classList.remove("hidden");
      registerSubmitBtn.disabled = false;
      return;
    }

    auth.createUserWithEmailAndPassword(email, password)
      .then(function (credential) {
        // สมัครสำเร็จ → สร้างไฟล์โปรไฟล์ที่ users/{uid} ทันที
        // role เริ่มต้นเป็น employee เสมอ ผู้ใช้เลือกเองไม่ได้
        return db.collection("users").doc(credential.user.uid).set({
          name: name,
          email: email,
          role: "employee"
        });
      })
      .then(function () {
        registerSuccess.textContent = "สมัครสมาชิกสำเร็จ กำลังไปยังหน้ารายการใบลา…";
        registerSuccess.classList.remove("hidden");
        setTimeout(function () {
          location.href = "leave-requests.html";
        }, 1200);
      })
      .catch(function (error) {
        registerError.textContent = "⚠️ " + แปลข้อผิดพลาดAuth(error);
        registerError.classList.remove("hidden");
        registerSubmitBtn.disabled = false;
      });
  });
}
