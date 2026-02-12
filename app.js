// ===== إعدادات =====
const UPDATE_HOUR = 22; // 10 مساء
const START_DATE = new Date(2026, 1, 11); // 11 فبراير 2026

function getAppDate(now = new Date()) {
  const d = new Date(now);

  // بعد 10 مساء نعتبر اليوم الجديد
  if (d.getHours() >= UPDATE_HOUR) {
    d.setDate(d.getDate() + 1);
  }

  d.setHours(12, 0, 0, 0); // تثبيت وقت الظهر
  return d;
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
  const fmt = new Intl.DateTimeFormat("ar-SA-u-ca-islamic-umalqura", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const parts = fmt.formatToParts(d);
  const get = (t) => parts.find((p) => p.type === t)?.value ?? "";
  const y = get("year"), m = get("month"), day = get("day");
  return `${day} / ${m} / ${y}`;
}

function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

function render() {
  const d = getAppDate();
  setText("dayName", weekdayAr(d));
  setText("gregDate", fmtYMD(d));
  setText("hijriDate", hijriYMD(d));
}

function scheduleNextTick() {
  const now = new Date();
  const next = new Date(now);

  next.setHours(UPDATE_HOUR, 0, 2, 0); // 10:00:02
  if (now >= next) next.setDate(next.getDate() + 1);

  setTimeout(() => {
    render();
    scheduleNextTick();
  }, next - now);
}

document.addEventListener("DOMContentLoaded", () => {
  render();
  scheduleNextTick();

  const btn = document.getElementById("saveBtn");
  if (!btn) return;

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

    canvas.toBlob(async (blob) => {
      if (!blob) return;

      const file = new File([blob], `calendar_${Date.now()}.png`, { type: "image/png" });

      // iPhone/Android (Share Sheet)
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: "Calendar" });
        return;
      }

      // fallback: تنزيل عادي
      const link = document.createElement("a");
      link.download = file.name;
      link.href = URL.createObjectURL(blob);
      link.click();
      setTimeout(() => URL.revokeObjectURL(link.href), 60000);
    }, "image/png");
  });
});
