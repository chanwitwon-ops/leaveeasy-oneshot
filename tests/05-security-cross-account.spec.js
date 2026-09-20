// US-08 [ความปลอดภัย] — ผู้ขอลาคนหนึ่ง เปิดใบลาของผู้ขอลาอีกคนไม่ได้
// "เข้าไม่ได้ = ผ่าน"
const { test, expect } = require("@playwright/test");
const { accounts, login, logout } = require("./helpers");

test("employee2 เปิดใบลาของ employee1 ตรง ๆ ผ่าน URL ต้องเปิดไม่ได้", async ({ page }) => {
  const หัวข้อลับ = "ใบลาส่วนตัวของ employee1 " + Date.now();

  // employee1 สร้างใบลา แล้วจดรหัสใบลาจาก URL
  await login(page, accounts.employee1);
  await page.goto("/new-leave-request.html");
  await page.locator("#title").fill(หัวข้อลับ);
  await page.locator("#reason").fill("ข้อมูลนี้ต้องเปิดไม่ได้จาก employee2");
  await page.locator("#leaveTypeId").selectOption({ label: "ลาป่วย" });
  await page.locator("#startDate").fill("2026-12-01");
  await page.locator("#endDate").fill("2026-12-02");
  await page.locator("#submit-btn").click();
  await page.waitForURL(/leave-requests(\.html)?$/);

  await page.locator("tr", { hasText: หัวข้อลับ }).click();
  await page.waitForURL(/leave-request-detail/);
  const รหัสใบลา = new URL(page.url()).searchParams.get("id");
  expect(รหัสใบลา).toBeTruthy();
  await logout(page);

  // employee2 ล็อกอิน แล้วพยายามเปิดใบลาเดียวกันตรง ๆ ผ่าน URL
  await login(page, accounts.employee2);
  await page.goto("/leave-request-detail.html?id=" + รหัสใบลา);

  // ต้องไม่เห็นเนื้อหาใบลาของ employee1 เลย ต้องขึ้นข้อความว่าเปิดไม่ได้
  await expect(page.locator("body")).not.toContainText(หัวข้อลับ);
  await expect(page.locator("#detail-container")).toContainText("ไม่พบใบขอลาที่ต้องการ");
});
