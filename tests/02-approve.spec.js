// US-04 — ผู้อนุมัติกดอนุมัติใบลา แล้วสถานะเปลี่ยนจริงทั้งจอและฐานข้อมูล
const { test, expect } = require("@playwright/test");
const { accounts, login, logout } = require("./helpers");

test("ผู้อนุมัติกดอนุมัติแล้วสถานะเปลี่ยนเป็นอนุมัติ และอยู่ทนหลังเปิดใหม่", async ({ page }) => {
  const หัวข้อทดสอบ = "ทดสอบอนุมัติ Playwright " + Date.now();

  // สร้างใบลาใหม่ด้วยบัญชี employee ก่อน
  await login(page, accounts.employee1);
  await page.goto("/new-leave-request.html");
  await page.locator("#title").fill(หัวข้อทดสอบ);
  await page.locator("#reason").fill("เหตุผลสำหรับเทสต์อนุมัติ");
  await page.locator("#leaveTypeId").selectOption({ label: "ลาพักร้อน" });
  await page.locator("#startDate").fill("2026-11-10");
  await page.locator("#endDate").fill("2026-11-11");
  await page.locator("#submit-btn").click();
  await page.waitForURL(/leave-requests(\.html)?$/);
  await logout(page);

  // ล็อกอินเป็นผู้อนุมัติ เปิดใบลานั้น แล้วกดอนุมัติ
  await login(page, accounts.manager);
  await page.goto("/leave-requests.html");
  await page.locator("tr", { hasText: หัวข้อทดสอบ }).click();

  await expect(page.locator("#detail-container")).toContainText("รอพิจารณา");
  await page.locator("#approve-btn").click();
  await expect(page.locator("#detail-container")).toContainText("อนุมัติ");
  await expect(page.locator("#approve-btn")).toBeHidden();

  // เปิดหน้าใหม่ (จำลอง "ปิดแล้วเปิดใหม่") แล้วสถานะต้องยังเป็นอนุมัติ ไม่ใช่แค่ state ชั่วคราว
  await page.reload();
  await expect(page.locator("#detail-container")).toContainText("อนุมัติ");
});
