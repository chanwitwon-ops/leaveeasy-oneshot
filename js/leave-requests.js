// ─────────────────────────────────────────────────────────────
// js/leave-requests.js — หน้าที่ 1 รายการใบลา
// อ่านข้อมูลจริงจาก Firestore collection "leaveRequests"
//
// สิทธิ์การมองเห็น (US-08):
// - employee เห็นเฉพาะใบของตัวเอง (requesterId == uid ของตัวเอง)
// - manager / hr เห็นทุกใบ
// ─────────────────────────────────────────────────────────────

(function () {
  var tbody = document.getElementById("leave-requests-list");
  var table = document.getElementById("leave-requests-table");
  var emptyState = document.getElementById("empty-state");

  window.currentUserPromise.then(function (user) {
    if (!user) return; // nav.js กำลังเด้งไปหน้า login.html อยู่แล้ว

    var query = db.collection("leaveRequests");

    // ผู้ขอลา (employee) เห็นเฉพาะใบของตัวเอง — ต้องกรองที่ query เลย
    // ไม่ใช่กรองหลังดึงข้อมูลมา เพราะกฎเฝ้าข้อมูลจะปฏิเสธการอ่านทั้งหมดถ้า query ไม่กรอง
    if (user.role === "employee") {
      query = query.where("requesterId", "==", user.uid);
    }

    // ถ้ามีสถานะติดมาท้าย URL (เช่นจากแดชบอร์ด) ให้กรองเฉพาะสถานะนั้น
    var สถานะที่กรอง = ค่าจากURL("status");
    if (สถานะที่กรอง) {
      query = query.where("status", "==", สถานะที่กรอง);
      var subtitle = document.querySelector(".subtitle");
      if (subtitle) {
        subtitle.textContent =
          "กำลังแสดงเฉพาะใบลาที่สถานะ " + สถานะที่กรอง + " · กดเมนู รายการใบลา เพื่อดูทั้งหมด";
      }
    }

    query.get().then(function (snapshot) {
      var รายการ = [];
      snapshot.forEach(function (doc) {
        รายการ.push(Object.assign({ id: doc.id }, doc.data()));
      });
      แสดงตาราง(รายการ);
    }).catch(function (err) {
      console.error("โหลดรายการใบลาไม่สำเร็จ", err);
      table.classList.add("hidden");
      emptyState.classList.remove("hidden");
      emptyState.querySelector("p").textContent = "โหลดข้อมูลไม่สำเร็จ: " + (err.message || "เกิดข้อผิดพลาด");
    });
  });

  function แสดงตาราง(รายการ) {
    if (รายการ.length === 0) {
      table.classList.add("hidden");
      emptyState.classList.remove("hidden");
      return;
    }

    table.classList.remove("hidden");
    emptyState.classList.add("hidden");

    var html = "";
    รายการ.forEach(function (ใบ) {
      html +=
        '<tr class="clickable" data-id="' + esc(ใบ.id) + '">' +
        "<td>" + esc(ใบ.title) + "</td>" +
        "<td>" + esc(ใบ.leaveTypeName) + "</td>" +
        "<td>" + ป้ายสถานะ(ใบ.status) + "</td>" +
        '<td class="hide-mobile">' + esc(ใบ.requesterName) + "</td>" +
        '<td class="hide-mobile">' + esc(ใบ.startDate) + " ถึง " + esc(ใบ.endDate) + "</td>" +
        "</tr>";
    });
    tbody.innerHTML = html;

    // กดที่แถวไหน ไปหน้ารายละเอียดของใบนั้น
    tbody.querySelectorAll("tr.clickable").forEach(function (แถว) {
      แถว.addEventListener("click", function () {
        location.href = "leave-request-detail.html?id=" + แถว.dataset.id;
      });
    });
  }
})();
