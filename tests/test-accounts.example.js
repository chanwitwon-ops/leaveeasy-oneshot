// ─────────────────────────────────────────────────────────────
// tests/test-accounts.example.js — ต้นแบบบัญชีทดสอบสำหรับ Playwright
//
// ไฟล์นี้ไม่มีรหัสผ่านจริง จึง commit ขึ้น GitHub ได้อย่างปลอดภัย
// ไฟล์จริงคือ tests/test-accounts.local.js ซึ่งถูกกันไว้ใน .gitignore แล้ว
// (บัญชีเป็นของปลอมในโปรเจกต์เรียน แต่ยังไม่ควรพิมพ์รหัสผ่านลง repo สาธารณะ)
//
// คัดลอกไฟล์นี้เป็น tests/test-accounts.local.js แล้วใส่ค่าจริง
// (สมัครบัญชีผ่าน register.html ก่อน แล้วตั้ง role ใน Firebase Console
//  ตามที่ต้องการ — employee เป็นค่าเริ่มต้นอยู่แล้ว)
// ─────────────────────────────────────────────────────────────

module.exports = {
  manager: { email: "manager@example.com", password: "รหัสผ่านจริง", role: "manager", name: "ชื่อที่สมัครไว้" },
  employee1: { email: "employee1@example.com", password: "รหัสผ่านจริง", role: "employee", name: "ชื่อที่สมัครไว้" },
  employee2: { email: "employee2@example.com", password: "รหัสผ่านจริง", role: "employee", name: "ชื่อที่สมัครไว้" },
};
