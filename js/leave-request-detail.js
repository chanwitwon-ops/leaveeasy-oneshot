// ─────────────────────────────────────────────────────────────
// js/leave-request-detail.js — หน้าที่ 3 รายละเอียดใบลา
// อ่าน/แก้/ลบข้อมูลจริงจาก Firestore
//
// กติกาสถานะ (หัวข้อ 6 ของสเปค):
// - อนุมัติ/ไม่อนุมัติ ได้เฉพาะ manager/hr และเฉพาะใบที่ยังรอพิจารณา
// - เปลี่ยนเป็นไม่อนุมัติ ต้องมีความเห็นอย่างน้อย 1 รายการมาก่อน
// - ลบใบได้เฉพาะเจ้าของใบ และเฉพาะใบที่ยังรอพิจารณา
// - เขียนความเห็นใหม่ได้เฉพาะ manager/hr (ตามกฎเฝ้าข้อมูล subcollection approvals)
// ─────────────────────────────────────────────────────────────

(function () {
  var รหัสใบลา = ค่าจากURL("id");

  var detailContainer = document.getElementById("detail-container");
  var actionButtons = document.getElementById("action-buttons");
  var approveBtn = document.getElementById("approve-btn");
  var rejectBtn = document.getElementById("reject-btn");
  var deleteBtn = document.getElementById("delete-btn");

  var commentsSection = document.getElementById("comments-section");
  var commentsList = document.getElementById("comments-list");
  var emptyComments = document.getElementById("empty-comments");
  var commentInput = document.getElementById("comment-input");
  var commentError = document.getElementById("comment-error");
  var submitCommentBtn = document.getElementById("submit-comment-btn");
  var commentLabel = document.querySelector('label[for="comment-input"]');
  var commentBtnRow = submitCommentBtn ? submitCommentBtn.closest(".btn-row") : null;

  var ใบRef, ใบ, ผู้ใช้ปัจจุบัน, จำนวนความเห็น = 0;

  window.currentUserPromise.then(function (user) {
    if (!user) return; // nav.js กำลังเด้งไปหน้า login.html อยู่แล้ว
    ผู้ใช้ปัจจุบัน = user;

    if (!รหัสใบลา) {
      แสดงไม่พบ();
      return;
    }

    ใบRef = db.collection("leaveRequests").doc(รหัสใบลา);

    ใบRef.get().then(function (doc) {
      if (!doc.exists) {
        แสดงไม่พบ();
        return;
      }
      ใบ = Object.assign({ id: doc.id }, doc.data());
      วาดใบลา();
      โหลดความเห็น();
    }).catch(function (err) {
      // เจอ permission-denied เมื่อเปิดใบของคนอื่นที่ตัวเองไม่มีสิทธิ์เห็น (US-08)
      console.error("เปิดใบลาไม่สำเร็จ", err);
      แสดงไม่พบ();
    });
  });

  function แสดงไม่พบ() {
    detailContainer.innerHTML = "<p>ไม่พบใบขอลาที่ต้องการ — อาจถูกลบไปแล้ว ไม่มีสิทธิ์เปิดดู หรือลิงก์ไม่ถูกต้อง</p>";
    actionButtons.classList.add("hidden");
    commentsSection.classList.add("hidden");
  }

  // ── วาดข้อมูลใบลาลงหน้าจอ ──
  function วาดใบลา() {
    var แถว = [
      ["หัวข้อ", esc(ใบ.title)],
      ["เหตุผลการลา", esc(ใบ.reason)],
      ["ประเภทการลา", esc(ใบ.leaveTypeName)],
      ["วันที่ลา", esc(ใบ.startDate) + " ถึง " + esc(ใบ.endDate)],
      ["ผู้ขอลา", esc(ใบ.requesterName)],
      ["ผู้อนุมัติ", ใบ.approverName ? esc(ใบ.approverName) : "ยังไม่ได้กำหนดผู้อนุมัติ"],
      ["สถานะ", ป้ายสถานะ(ใบ.status)],
      ["วันที่ยื่น", esc(ใบ.createdAt)]
    ];

    detailContainer.innerHTML = แถว.map(function (r) {
      return '<div class="field-row"><span class="k">' + r[0] + "</span><span>" + r[1] + "</span></div>";
    }).join("");

    var เป็นผู้อนุมัติ = ผู้ใช้ปัจจุบัน.role === "manager" || ผู้ใช้ปัจจุบัน.role === "hr";
    var เป็นเจ้าของใบ = ผู้ใช้ปัจจุบัน.uid === ใบ.requesterId;
    var ยังรอพิจารณา = ใบ.status === "รอพิจารณา";

    var ปุ่มใดปุ่มหนึ่งแสดง = false;

    if (เป็นผู้อนุมัติ && ยังรอพิจารณา) {
      approveBtn.classList.remove("hidden");
      rejectBtn.classList.remove("hidden");
      ปุ่มใดปุ่มหนึ่งแสดง = true;
    } else {
      approveBtn.classList.add("hidden");
      rejectBtn.classList.add("hidden");
    }

    if (เป็นเจ้าของใบ && ยังรอพิจารณา) {
      deleteBtn.classList.remove("hidden");
      ปุ่มใดปุ่มหนึ่งแสดง = true;
    } else {
      deleteBtn.classList.add("hidden");
    }

    actionButtons.classList.toggle("hidden", !ปุ่มใดปุ่มหนึ่งแสดง);

    // กล่องเขียนความเห็นใหม่ เขียนได้เฉพาะผู้อนุมัติ/ฝ่ายบุคคล (ตรงกับกฎเฝ้าข้อมูล)
    var แสดงกล่องเขียนความเห็น = เป็นผู้อนุมัติ;
    [commentLabel, commentInput, commentBtnRow].forEach(function (el) {
      if (el) el.classList.toggle("hidden", !แสดงกล่องเขียนความเห็น);
    });
  }

  approveBtn.addEventListener("click", function () { เปลี่ยนสถานะ("อนุมัติ"); });
  rejectBtn.addEventListener("click", function () { เปลี่ยนสถานะ("ไม่อนุมัติ"); });
  deleteBtn.addEventListener("click", ลบใบลา);
  submitCommentBtn.addEventListener("click", ส่งความเห็น);

  // ── เปลี่ยนสถานะ (แก้เฉพาะช่อง status เท่านั้น ห้ามเขียนทับช่องอื่น) ──
  function เปลี่ยนสถานะ(สถานะใหม่) {
    if (สถานะใหม่ === "ไม่อนุมัติ" && จำนวนความเห็น === 0) {
      alert("ต้องเขียนความเห็นอย่างน้อย 1 รายการก่อน จึงจะกดไม่อนุมัติได้");
      return;
    }

    approveBtn.disabled = true;
    rejectBtn.disabled = true;

    ใบRef.update({ status: สถานะใหม่ }).then(function () {
      ใบ.status = สถานะใหม่;
      วาดใบลา();
    }).catch(function (err) {
      console.error("เปลี่ยนสถานะไม่สำเร็จ", err);
      alert("เปลี่ยนสถานะไม่สำเร็จ: " + (err.message || "เกิดข้อผิดพลาด"));
    }).finally(function () {
      approveBtn.disabled = false;
      rejectBtn.disabled = false;
    });
  }

  // ── ลบใบลา (เฉพาะเจ้าของใบ และเฉพาะสถานะรอพิจารณา — ยืนยันก่อนเสมอ) ──
  function ลบใบลา() {
    if (!confirm('ยืนยันการลบใบลา "' + ใบ.title + '" หรือไม่ — ลบแล้วกู้คืนไม่ได้')) return;

    deleteBtn.disabled = true;
    ใบRef.delete().then(function () {
      location.href = "leave-requests.html";
    }).catch(function (err) {
      console.error("ลบใบลาไม่สำเร็จ", err);
      alert("ลบไม่สำเร็จ: " + (err.message || "เกิดข้อผิดพลาด"));
      deleteBtn.disabled = false;
    });
  }

  // ── โหลดรายการความเห็น เรียงจากเก่าไปใหม่ ──
  function โหลดความเห็น() {
    ใบRef.collection("approvals").orderBy("createdAt", "asc").get().then(function (snapshot) {
      var รายการ = [];
      snapshot.forEach(function (doc) { รายการ.push(doc.data()); });
      จำนวนความเห็น = รายการ.length;
      วาดความเห็น(รายการ);
      commentsSection.classList.remove("hidden");
    }).catch(function (err) {
      console.error("โหลดความเห็นไม่สำเร็จ", err);
      commentsList.innerHTML = "";
      emptyComments.classList.remove("hidden");
      commentsSection.classList.remove("hidden");
    });
  }

  function วาดความเห็น(รายการ) {
    if (รายการ.length === 0) {
      commentsList.innerHTML = "";
      emptyComments.classList.remove("hidden");
      return;
    }
    emptyComments.classList.add("hidden");
    commentsList.innerHTML = รายการ.map(function (c) {
      return '<div class="comment"><div class="meta">' + esc(c.authorName) + " · " + esc(c.createdAt) +
             "</div><div>" + esc(c.message) + "</div></div>";
    }).join("");
  }

  // ── ส่งความเห็นใหม่ ──
  function ส่งความเห็น() {
    var ข้อความ = commentInput.value.trim();

    if (!ข้อความ) {
      commentError.textContent = "⚠️ พิมพ์ข้อความก่อน จึงจะส่งความเห็นได้";
      commentError.classList.remove("hidden");
      return;
    }
    commentError.classList.add("hidden");
    submitCommentBtn.disabled = true;

    ใบRef.collection("approvals").add({
      authorId: ผู้ใช้ปัจจุบัน.uid,
      authorName: ผู้ใช้ปัจจุบัน.name,
      message: ข้อความ,
      createdAt: เวลาตอนนี้()
    }).then(function () {
      commentInput.value = "";
      โหลดความเห็น();
    }).catch(function (err) {
      console.error("ส่งความเห็นไม่สำเร็จ", err);
      commentError.textContent = "⚠️ ส่งไม่สำเร็จ: " + (err.message || "เกิดข้อผิดพลาด");
      commentError.classList.remove("hidden");
    }).finally(function () {
      submitCommentBtn.disabled = false;
    });
  }
})();
