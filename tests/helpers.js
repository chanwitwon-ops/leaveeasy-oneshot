// ─────────────────────────────────────────────────────────────
// tests/helpers.js — ฟังก์ชันช่วยที่ใช้ร่วมกันในหลายเทสต์
// ─────────────────────────────────────────────────────────────
const accounts = require("./test-accounts.local");

/** ล็อกอินด้วยบัญชีที่ระบุ (ต้องอยู่ที่หน้า login.html หรือหน้าไหนก็ได้ที่ยังไม่ล็อกอิน) */
async function login(page, account) {
  await page.goto("/login.html");
  await page.locator("#email").fill(account.email);
  await page.locator("#password").fill(account.password);
  await page.locator("#login-submit-btn").click();
  await page.waitForURL(/leave-requests(\.html)?$/);
}

async function logout(page) {
  const btn = page.locator("#logout-btn");
  if (await btn.count()) {
    await btn.click();
    await page.waitForURL(/login(\.html)?$/);
  }
}

module.exports = { accounts, login, logout };
