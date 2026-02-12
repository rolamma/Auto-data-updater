// ===== إعدادات =====
const UPDATE_HOUR = 22; // 10 مساء
const START_DATE = new Date(2026, 1, 11); // ✅ 11 فبراير 2026 (الشهر يبدأ من 0)

function getAppDate(now = new Date()) {
  const d = new Date(now);

  if (d.getHours() >= UPDATE_HOUR) {
    d.setDate(d.getDate() + 1);
  }

  d.setHours(12, 0, 0, 0);
  return d;


  // إذا الوقت قبل 10 مساء، نعتبر ما دخلنا "يوم النظام" الجديد
  if (now < todayAtUpdate) {
    todayAtUpdate.setDate(todayAtUpdate.getDate() - 1);
  }

  // كم يوم مرّ من تاريخ البداية
  const daysPassed = Math.floor(
    (todayAtUpdate - START_DATE) / (1000 * 60 * 60 * 24)
  );

  // تاريخ التطبيق = START_DATE + الأيام
  const appDate = new Date(START_DATE);
  appDate.setDate(appDate.getDate() + Math.max(0, daysPassed));
  appDate.setHours(12, 0, 0, 0); // تثبيت وقت الظهر لتجنب مشاكل التوقيت

  return appDate;
}

function fmtYMD(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y} / ${m} / ${day}`;
}

function weekdayAr(d) {
  const names = ["الأحد","الإثنين","الثلاثاء","الأربعاء","الخميس","الجمعة","السبت"];
  return names[d.getDay()];
}

function hijriYMD(d) {
  // ✅ أم القرى (الأدق في السعودية)
  const fmt = new Intl.DateTimeFormat("ar-SA-u-ca-islamic-umalqura", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const parts = fmt.formatToParts(d);
  const get = (t) => parts.find((p) => p.type === t)?.value ?? "";
  const y = get("year"), m = get("month"), day = get("day");

  // ✅ عرض: يوم / شهر / سنة  (23 / 08 / 1447)
  return `${day} / ${m} / ${y}`;
}

function setText(id, text) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = text;
}

// ===== رندر الصفحة =====
function render() {
  const d = getAppDate();

  setText("dayName", weekdayAr(d));
  setText("gregDate", fmtYMD(d));
  setText("hijriDate", hijriYMD(d));

  console.log("render ok ✅", {
    now: new Date().toString(),
    appDate: d.toString(),
    greg: fmtYMD(d),
    hijri: hijriYMD(d),
  });
}

// ===== جدولة التحديث اليومي =====
function scheduleNextTick() {
  const now = new Date();
  const next = new Date(now);

  next.setHours(UPDATE_HOUR, 0, 2, 0); // 10:00:02
  if (now >= next) next.setDate(next.getDate() + 1);

  const ms = next - now;
  console.log("Next update in (ms):", ms, "at:", next.toString());

  setTimeout(() => {
    render();
    scheduleNextTick();
  }, ms);
}

// ===== تشغيل أول مرة =====
document.addEventListener("DOMContentLoaded", () => {
  render();
  scheduleNextTick();
});
document.addEventListener("DOMContentLoaded", () => {
  render();
  scheduleNextTick();

  // زر حفظ الصورة
  const btn = document.getElementById("saveBtn");
  if (btn) {
    btn.addEventListener("click", async () => {
      const phone = document.querySelector(".phone");
      if (!phone) return;

      btn.style.display = "none";
      await new Promise((r) => requestAnimationFrame(r));

      const canvas = await html2canvas(phone, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
      });

      btn.style.display = "";

      const link = document.createElement("a");
      link.download = "calendar_${Date.now()}.png"; // ✅ صح
      link.href = canvas.toDataURL("image/png");
      link.click();
    });
  }
});