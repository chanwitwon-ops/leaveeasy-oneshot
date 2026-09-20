// US-06 — ฝ่ายบุคคล (hr) เพิ่ม/แก้/ลบ ประเภทการลา แล้วตารางและรายการเลื่อนลงอัปเดตจริง
//
// ⚠️ ต้องมีบัญชี hr ที่ users/{uid}.role == "hr" จริงใน Firestore ก่อนจึงจะผ่านได้
// (ดูหมายเหตุใน tests/test-accounts.local.js — ต้องตั้ง role ผ่าน Firebase Console)
const { test, expect } = require("@playwright/test");
const { accounts, login } = require("./helpers");

test("hr เพิ่ม/แก้/ลบ ประเภทการลาใหม่ ได้จริงและตารางอัปเดตทันที", async ({ page }) => {
  const ชื่อประเภทใหม่ = "ทดสอบประเภท Playwright " + Date.now();
  const ชื่อประเภทที่แก้แล้ว = ชื่อประเภทใหม่ + " (แก้ไขแล้ว)";

  await login(page, accounts.hr);
  await page.goto("/leave-types.html");

  // รอให้หน้าโหลดสิทธิ์ hr และผูกปุ่มเสร็จก่อน (โหลดและวาด() วาดตารางเดิมเสร็จ = ปุ่มเพิ่มพร้อมใช้แล้ว)
  await expect(page.locator("tr", { hasText: "ลาพักร้อน" })).toBeVisible();

  // ── เพิ่มประเภทใหม่ ──
  await page.locator("#ชื่อประเภทใหม่").fill(ชื่อประเภทใหม่);
  await page.locator("#ปุ่มเพิ่ม").click();

  const แถวประเภท = page.locator("tr", { hasText: ชื่อประเภทใหม่ });
  await expect(แถวประเภท).toBeVisible();

  // ประเภทที่เพิ่มใหม่ต้องไปโผล่ในรายการเลื่อนลงของหน้ายื่นใบลาใหม่ทันที
  await page.goto("/new-leave-request.html");
  await expect(page.locator("#leaveTypeId")).toContainText(ชื่อประเภทใหม่);

  // ── แก้ไขชื่อประเภท ──
  await page.goto("/leave-types.html");
  page.once("dialog", async (dialog) => {
    expect(dialog.type()).toBe("prompt");
    await dialog.accept(ชื่อประเภทที่แก้แล้ว);
  });
  await page.locator("tr", { hasText: ชื่อประเภทใหม่ }).locator('[data-edit]').click();

  await expect(page.locator("tr", { hasText: ชื่อประเภทที่แก้แล้ว })).toBeVisible();

  // รีเฟรชแล้วชื่อที่แก้ต้องยังอยู่ (เขียนจริงลง Firestore ไม่ใช่แค่ state ชั่วคราว)
  await page.reload();
  await expect(page.locator("tr", { hasText: ชื่อประเภทที่แก้แล้ว })).toBeVisible();

  // ── ลบประเภท ──
  page.once("dialog", async (dialog) => {
    expect(dialog.type()).toBe("confirm");
    await dialog.accept();
  });
  await page.locator("tr", { hasText: ชื่อประเภทที่แก้แล้ว }).locator('[data-del]').click();

  await expect(page.locator("tr", { hasText: ชื่อประเภทที่แก้แล้ว })).toHaveCount(0);

  // รีเฟรชแล้วต้องหายไปจริง ไม่ใช่แค่ลบออกจากจอชั่วคราว
  await page.reload();
  await expect(page.locator("tr", { hasText: ชื่อประเภทที่แก้แล้ว })).toHaveCount(0);
});

test("employee ธรรมดาเปิดหน้าประเภทการลา ต้องไม่เห็นฟอร์มเพิ่ม/ปุ่มแก้ไข-ลบ", async ({ page }) => {
  await login(page, accounts.employee1);
  await page.goto("/leave-types.html");

  // การ์ดเพิ่มประเภทใหม่ต้องถูกซ่อนสำหรับคนที่ไม่ใช่ hr
  await expect(page.locator("#การ์ดเพิ่มประเภท")).toBeHidden();
  await expect(page.locator("[data-edit]")).toHaveCount(0);
  await expect(page.locator("[data-del]")).toHaveCount(0);
});
