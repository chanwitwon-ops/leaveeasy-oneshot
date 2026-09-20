// US-08 [ความปลอดภัย] — ไม่ล็อกอินแล้วเปิดหน้ารายการใบลา ต้องอ่านข้อมูลไม่ได้เลย
// "เข้าไม่ได้ = ผ่าน"
const { test, expect } = require("@playwright/test");

test("ไม่ล็อกอินแล้วเปิดหน้ารายการใบลา ต้องถูกเด้งไปหน้าล็อกอิน อ่านข้อมูลไม่ได้", async ({ page }) => {
  // ไม่ login เลย — page/context นี้สดใหม่ ไม่มี session ค้าง
  await page.goto("/leave-requests.html");

  // nav.js ต้องเด้งไป login.html ทันทีเพราะยังไม่ได้ล็อกอิน
  await page.waitForURL(/login(\.html)?$/);
  await expect(page.locator("#login-form")).toBeVisible();

  // ต้องไม่มีข้อมูลใบลาใด ๆ หลุดออกมาบนหน้าจอก่อนถูกเด้ง
  await expect(page.locator("body")).not.toContainText("ลาพักร้อนไปเที่ยวกับครอบครัว");
});

test("ไม่ล็อกอินแล้วเปิดหน้ารายละเอียดใบลาตรง ๆ ผ่าน URL ต้องอ่านข้อมูลไม่ได้เลย", async ({ page }) => {
  await page.goto("/leave-request-detail.html?id=lr001");
  await page.waitForURL(/login(\.html)?$/);
  await expect(page.locator("body")).not.toContainText("ลาพักร้อนไปเที่ยวกับครอบครัว");
});
