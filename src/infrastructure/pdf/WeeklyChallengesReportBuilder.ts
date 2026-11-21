import type {
  WeeklyChallengeSchedule,
  DailyChallengePlan,
} from "@domain/games/dailyChallenges/DailyChallengeTypes";
import { getTimeTagOption } from "@domain/games/dailyChallenges/DailyChallengeTypes";

export interface WeeklyChallengesReportInput {
  readonly schedule: WeeklyChallengeSchedule;
  readonly weekStartJalali: string;
  readonly weekEndJalali: string;
  readonly profileName?: string;
  readonly fontBaseUrl: string;
}

export function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function getStatusBadgeHtml(day: DailyChallengePlan): string {
  if (day.isOff || day.status === "off") {
    const reason = day.offReason ? ` (${escapeHtml(day.offReason)})` : "";
    return `<span class="badge badge-off">روز استراحت / آف${reason}</span>`;
  }
  if (day.status === "completed") {
    return '<span class="badge badge-completed">✓ انجام شد</span>';
  }
  if (day.status === "skipped") {
    return '<span class="badge badge-skipped">✕ انجام نشد</span>';
  }
  return '<span class="badge badge-pending">در انتظار</span>';
}

function formatTags(day: DailyChallengePlan): string {
  const tags = day.challengeTimeTags ?? ["any"];
  return tags
    .map((tag) => getTimeTagOption(tag)?.label ?? tag)
    .join(" · ");
}

export function buildWeeklyChallengesReportHtml(input: WeeklyChallengesReportInput): string {
  const { schedule, weekStartJalali, weekEndJalali, profileName, fontBaseUrl } = input;

  const totalDays = schedule.days.length;
  const completed = schedule.days.filter((d) => d.status === "completed").length;
  const offDays = schedule.days.filter((d) => d.isOff || d.status === "off").length;
  const skipped = schedule.days.filter((d) => d.status === "skipped").length;
  const pending = schedule.days.filter((d) => d.status === "pending" && !d.isOff).length;
  const rate = totalDays > 0 ? Math.round(((completed + offDays) / totalDays) * 100) : 0;

  const rows = schedule.days
    .map((day) => {
      const timeTagLabel = formatTags(day);
      const badge = getStatusBadgeHtml(day);

      const feedbackParts: string[] = [];
      if (day.completionNote) {
        feedbackParts.push(`یادداشت: ${escapeHtml(day.completionNote)}`);
      }
      if (day.completedAt) {
        feedbackParts.push(`<span class="empty">زمان ثبت: ${escapeHtml(day.completedAt)}</span>`);
      }
      const feedbackHtml = feedbackParts.length > 0
        ? feedbackParts.map((p) => `<div class="feedback-item">${p}</div>`).join("")
        : '<span class="empty">—</span>';

      return `
        <tr>
          <td class="col-day">
            <div class="day-title">${escapeHtml(day.dayName)}</div>
            <div class="day-date">${escapeHtml(day.jalaliDateLabel)}</div>
          </td>
          <td class="col-challenge">
            <div class="challenge-title">${escapeHtml(day.challengeTitle)}</div>
            ${day.challengeDescription ? `<div class="challenge-desc">${escapeHtml(day.challengeDescription)}</div>` : ""}
          </td>
          <td class="col-tag">
            <span class="tag-pill">${escapeHtml(timeTagLabel || "هر زمان")}</span>
          </td>
          <td class="col-status">${badge}</td>
          <td class="col-feedback">${feedbackHtml}</td>
        </tr>
      `;
    })
    .join("");

  return `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
<meta charset="UTF-8" />
<title>گزارش هفتگی چالش‌های دونفره</title>
<style>
@font-face { font-family: Vazirmatn; src: url("${escapeHtml(fontBaseUrl)}/Vazirmatn-Regular.woff2") format("woff2"); font-weight: 400; }
@font-face { font-family: Vazirmatn; src: url("${escapeHtml(fontBaseUrl)}/Vazirmatn-Bold.woff2") format("woff2"); font-weight: 700; }
* { box-sizing: border-box; }
body {
  font-family: Vazirmatn, system-ui, sans-serif;
  direction: rtl;
  color: #0f172a;
  padding: 24px;
  line-height: 1.6;
  background: #ffffff;
}
.header {
  border-bottom: 2px solid #e2e8f0;
  padding-bottom: 12px;
  margin-bottom: 20px;
}
.title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
h1 {
  font-size: 20px;
  margin: 0;
  color: #0f172a;
}
.subtitle {
  color: #64748b;
  font-size: 13px;
  margin-top: 4px;
}
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 24px;
}
.stat-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 10px 14px;
  text-align: center;
}
.stat-value {
  font-size: 20px;
  font-weight: 700;
  color: #0f172a;
}
.stat-label {
  font-size: 11px;
  color: #64748b;
  margin-top: 2px;
}
table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
  margin-bottom: 20px;
}
th, td {
  border: 1px solid #e2e8f0;
  padding: 10px 12px;
  text-align: right;
  vertical-align: top;
}
th {
  background: #1e293b;
  color: #ffffff;
  font-weight: 700;
  font-size: 12px;
}
tr { break-inside: avoid; }
.col-day { width: 14%; font-weight: 700; }
.day-title { font-size: 13px; color: #0f172a; }
.day-date { font-size: 11px; color: #64748b; font-weight: 400; margin-top: 2px; }
.col-challenge { width: 35%; }
.challenge-title { font-size: 12.5px; font-weight: 700; color: #0f172a; }
.challenge-desc { font-size: 11px; color: #475569; margin-top: 4px; line-height: 1.5; }
.col-tag { width: 13%; }
.tag-pill {
  display: inline-block;
  background: #f1f5f9;
  color: #475569;
  border-radius: 6px;
  padding: 2px 6px;
  font-size: 10.5px;
}
.col-status { width: 15%; }
.badge {
  display: inline-block;
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 700;
}
.badge-completed { background: #dcfce7; color: #166534; }
.badge-off { background: #e0f2fe; color: #0369a1; }
.badge-skipped { background: #ffe4e6; color: #9f1239; }
.badge-pending { background: #f1f5f9; color: #64748b; }
.col-feedback { width: 23%; font-size: 11px; }
.feedback-item { margin-bottom: 3px; color: #334155; }
.empty { color: #94a3b8; font-size: 10px; }
.footer {
  margin-top: 30px;
  padding-top: 12px;
  border-top: 1px dashed #cbd5e1;
  text-align: center;
  font-size: 11px;
  color: #64748b;
}
@media print {
  @page { size: A4; margin: 12mm; }
  body { padding: 0; }
}
</style>
</head>
<body>
<div class="header">
  <div class="title-row">
    <h1>گزارش هفتگی چالش‌های دونفره</h1>
    <div style="font-size: 12px; color: #64748b;">${escapeHtml(weekStartJalali)} الی ${escapeHtml(weekEndJalali)}</div>
  </div>
  <p class="subtitle">
    ${profileName ? `همراه عزیز: <strong>${escapeHtml(profileName)}</strong> · ` : ""}
    این سند خلاصه‌ای از چالش‌های هفتگی برای ساختن صمیمیت و لحظه‌های مشترک است.
  </p>
</div>

<div class="stats-grid">
  <div class="stat-card">
    <div class="stat-value">${completed.toLocaleString("fa-IR")}</div>
    <div class="stat-label">چالش‌های انجام‌شده</div>
  </div>
  <div class="stat-card">
    <div class="stat-value">${offDays.toLocaleString("fa-IR")}</div>
    <div class="stat-label">روزهای آف و استراحت</div>
  </div>
  <div class="stat-card">
    <div class="stat-value">${skipped.toLocaleString("fa-IR")}</div>
    <div class="stat-label">چالش‌های انجام‌نشده</div>
  </div>
  <div class="stat-card">
    <div class="stat-value">${rate.toLocaleString("fa-IR")}٪</div>
    <div class="stat-label">نرخ پیشرفت کل (${pending.toLocaleString("fa-IR")} در انتظار)</div>
  </div>
</div>

<table>
  <thead>
    <tr>
      <th>روز و تاریخ</th>
      <th>چالش پیشنهادی</th>
      <th>زمان مناسب</th>
      <th>وضعیت</th>
      <th>بازخورد و ثبت نتیجه</th>
    </tr>
  </thead>
  <tbody>
    ${rows}
  </tbody>
</table>

<div class="footer">
  «عشق در کارهای بزرگ خلاصه نمی‌شود؛ تکرار محبت‌های کوچک روزانه است که صمیمیت پایدار می‌سازد.»
</div>

<script>
document.fonts.ready.then(function () {
  window.focus();
  window.print();
});
</script>
</body>
</html>`;
}
