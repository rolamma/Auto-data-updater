// ===== إعدادات =====
const UPDATE_HOUR = 22;
const START_DATE = new Date(2026, 4, 6);

const countersConfig = {
  "n-retirement": 26,
  "n-university": 19,
  "n-salary": 18,
  "n-insurance": 26,
  "n-rehab": 20,
  "n-citizen": 4,
  "n-saned": 26,
  "n-hafiz": 30,
  "n-housing": 18,
};

function getAppDate(now = new Date()) {
  const d = new Date(now);

  // بعد 10 مساء يعتبر يوم جديد
  if (d.getHours() >= UPDATE_HOUR) {
    d.setDate(d.getDate() + 1);
  }

  d.setHours(12, 0, 0, 0);
  return d;
}

function fmtYMD(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y} / ${m} / ${day}`;
}

function weekdayAr(d) {
  const names = [
    "الأحد",
    "الإثنين",
    "الثلاثاء",
    "الأربعاء",
    "الخميس",
    "الجمعة",
    "السبت"
  ];

  return names[d.getDay()];
}

function hijriYMD(d) {
  const fmt = new Intl.DateTimeFormat(
    "ar-SA-u-ca-islamic-umalqura",
    {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }
  );

  const parts = fmt.formatToParts(d);

  const get = (t) =>
    parts.find((p) => p.type === t)?.value ?? "";

  const y = get("year");
  const m = get("month");
  const day = get("day");

  return `${day} / ${m} / ${y}`;
}

function setText(id, text) {
  const el = document.getElementById(id);

  if (el) {
    el.textContent = text;
  }
}

// كم يوم مر من البداية
function getPassedDays(appDate) {
  const start = new Date(START_DATE);

  start.setHours(12, 0, 0, 0);

  const diff = appDate - start;

  return Math.floor(
    diff / (1000 * 60 * 60 * 24)
  );
}

// ينقص يوميًا وإذا وصل صفر يرجع 30
function getCounterValue(startValue, passedDays) {
  const cycle = startValue + 1;

  let value =
    startValue - (passedDays % cycle);

  if (value < 0) {
    value = 30;
  }

  return value;
}

function renderCounters(appDate) {
  const passedDays = getPassedDays(appDate);

  Object.entries(countersConfig).forEach(
    ([id, startValue]) => {

      let value =
        startValue - passedDays;

      // إذا وصل أقل من صفر يرجع 30
      if (value < 0) {
        value = 30 - (
          (passedDays - startValue - 1) % 31
        );
      }

      setText(id, value);
    }
  );
}

function render() {
  const d = getAppDate();

  setText("dayName", weekdayAr(d));
  setText("gregDate", fmtYMD(d));
  setText("hijriDate", hijriYMD(d));

  renderCounters(d);
}

function scheduleNextTick() {
  const now = new Date();
  const next = new Date(now);

  next.setHours(UPDATE_HOUR, 0, 2, 0);

  if (now >= next) {
    next.setDate(next.getDate() + 1);
  }

  setTimeout(() => {
    render();
    scheduleNextTick();
  }, next - now);
}

document.addEventListener(
  "DOMContentLoaded",
  () => {

    render();
    scheduleNextTick();

    const btn =
      document.getElementById("saveBtn");

    if (!btn) return;

    btn.addEventListener(
      "click",
      async () => {

        const phone =
          document.querySelector(".phone");

        if (!phone) return;

        btn.style.display = "none";

        await new Promise((r) =>
          requestAnimationFrame(r)
        );

        const canvas =
          await html2canvas(phone, {
            backgroundColor: null,
            scale: 2,
            useCORS: true,
          });

        btn.style.display = "";

        canvas.toBlob(async (blob) => {

          if (!blob) return;

          const file = new File(
            [blob],
            `calendar_${Date.now()}.png`,
            {
              type: "image/png",
            }
          );

          // مشاركة الآيفون
          if (
            navigator.canShare &&
            navigator.canShare({
              files: [file],
            })
          ) {

            await navigator.share({
              files: [file],
              title: "Calendar",
            });

            return;
          }

          // تحميل عادي
          const link =
            document.createElement("a");

          link.download = file.name;
          link.href =
            URL.createObjectURL(blob);

          link.click();

          setTimeout(() => {
            URL.revokeObjectURL(link.href);
          }, 60000);

        }, "image/png");
      }
    );
  }
);