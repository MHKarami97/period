import type { Cycle } from "@domain/entities/Cycle";
import type { Symptom } from "@domain/entities/Symptom";
import { DateOnly } from "@domain/valueObjects/DateOnly";
import { CyclePredictionService } from "@domain/services/CyclePredictionService";

const SIX_MONTHS_IN_DAYS = 182;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * PrintReportService - Infrastructure adapter that renders the 6-month
 * summary as a Persian, right-to-left HTML document and hands it to the
 * BROWSER's own print engine for "Save as PDF". This deliberately
 * replaces a jsPDF + manual glyph-shaping approach: real browsers already
 * implement correct Arabic/Persian contextual shaping and bidi text
 * layout natively, which is both more correct and has zero extra
 * dependencies to maintain. Uses the same self-hosted Vazirmatn .woff2
 * files already shipped for the web UI — no separate TTF conversion
 * needed.
 */
export class PrintReportService {
  public static openSixMonthReport(
    cycles: readonly Cycle[],
    symptoms: readonly Symptom[],
    profileName?: string,
  ): void {
    const cutoff = DateOnly.today().addDays(-SIX_MONTHS_IN_DAYS);

    const recentCycles = [...cycles]
      .filter((cycle) => !cycle.startDate.isBefore(cutoff))
      .sort((a, b) => a.startDate.diffInDays(b.startDate));

    const recentSymptoms = [...symptoms]
      .filter((symptom) => !symptom.date.isBefore(cutoff))
      .sort((a, b) => a.date.diffInDays(b.date));

    const predictionSection = recentCycles.length > 0 ? PrintReportService.buildPredictionSection(recentCycles) : "";
    const cyclesSection = PrintReportService.buildCyclesSection(recentCycles);
    const symptomsSection = PrintReportService.buildSymptomsSection(recentSymptoms);

    const subtitle = profileName
      ? `تاریخ تولید: ${DateOnly.today().toIsoString()} &nbsp;|&nbsp; فرد: ${escapeHtml(profileName)}`
      : `تاریخ تولید: ${DateOnly.today().toIsoString()}`;

    const html = `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
<meta charset="UTF-8" />
<title>گزارش ۶ ماه اخیر</title>
<style>
  @font-face {
    font-family: "Vazirmatn";
    src: url("/fonts/webfonts/Vazirmatn-Regular.woff2") format("woff2");
    font-weight: 400;
  }
  @font-face {
    font-family: "Vazirmatn";
    src: url("/fonts/webfonts/Vazirmatn-Bold.woff2") format("woff2");
    font-weight: 700;
  }
  * { box-sizing: border-box; }
  body {
    font-family: "Vazirmatn", sans-serif;
    direction: rtl;
    color: #0f172a;
    padding: 24px;
  }
  h1 { font-size: 20px; margin-bottom: 4px; }
  .subtitle { color: #64748b; font-size: 13px; margin-bottom: 20px; }
  h2 { font-size: 15px; margin: 24px 0 8px; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 8px; }
  th, td { border: 1px solid #e2e8f0; padding: 6px 10px; text-align: right; }
  th { background: #334155; color: #fff; }
  tr:nth-child(even) td { background: #f8fafc; }
  @media print {
    @page { size: A4; margin: 16mm; }
  }
</style>
</head>
<body>
  <h1>گزارش ۶ ماه اخیر - ردیاب عادت‌ماهیانه</h1>
  <p class="subtitle">${subtitle}</p>
  ${predictionSection}
  ${cyclesSection}
  ${symptomsSection}
  <script>
    document.fonts.ready.then(() => {
      window.focus();
      window.print();
    });
  <\/script>
</body>
</html>`;

    const reportWindow = window.open("", "_blank");
    if (!reportWindow) {
      throw new Error("Popup blocked. Please allow popups for this site to generate the report.");
    }
    reportWindow.document.open();
    reportWindow.document.write(html);
    reportWindow.document.close();
  }

  private static buildPredictionSection(recentCycles: readonly Cycle[]): string {
    const prediction = CyclePredictionService.predictNextCycle(recentCycles);
    return `
    <h2>خلاصه پیش‌بینی</h2>
    <table>
      <thead><tr><th>شاخص</th><th>مقدار</th></tr></thead>
      <tbody>
        <tr><td>میانگین طول چرخه (WMA)</td><td>${prediction.predictedCycleLengthInDays} روز</td></tr>
        <tr><td>میانگین طول پریود</td><td>${prediction.predictedPeriodLengthInDays} روز</td></tr>
        <tr><td>پریود بعدی (پیش‌بینی)</td><td>${prediction.nextPeriodStartDate.toIsoString()}</td></tr>
        <tr><td>روز تخمک‌گذاری (پیش‌بینی)</td><td>${prediction.ovulationDate.toIsoString()}</td></tr>
        <tr><td>پنجره باروری</td><td>${prediction.fertileWindowStart.toIsoString()} تا ${prediction.fertileWindowEnd.toIsoString()}</td></tr>
      </tbody>
    </table>`;
  }

  private static buildCyclesSection(cycles: readonly Cycle[]): string {
    const rows = cycles
      .map(
        (cycle) => `
        <tr>
          <td>${cycle.startDate.toIsoString()}</td>
          <td>${cycle.endDate ? cycle.endDate.toIsoString() : "در جریان"}</td>
          <td>${cycle.periodLengthInDays !== null ? `${cycle.periodLengthInDays} روز` : "-"}</td>
        </tr>`,
      )
      .join("");

    return `
    <h2>پریودهای ثبت‌شده</h2>
    <table>
      <thead><tr><th>شروع پریود</th><th>پایان پریود</th><th>طول پریود</th></tr></thead>
      <tbody>${rows || `<tr><td colspan="3">داده‌ای در ۶ ماه اخیر ثبت نشده</td></tr>`}</tbody>
    </table>`;
  }

  private static buildSymptomsSection(symptoms: readonly Symptom[]): string {
    const rows = symptoms
      .map(
        (symptom) => `
        <tr>
          <td>${symptom.date.toIsoString()}</td>
          <td>${symptom.mood ? escapeHtml(symptom.mood) : "-"}</td>
          <td>${symptom.painLevel}/۴</td>
          <td>${escapeHtml(symptom.flowLevel)}</td>
        </tr>`,
      )
      .join("");

    return `
    <h2>علائم ثبت‌شده</h2>
    <table>
      <thead><tr><th>تاریخ</th><th>خلق‌وخو</th><th>درد</th><th>خونریزی</th></tr></thead>
      <tbody>${rows || `<tr><td colspan="4">علائمی در ۶ ماه اخیر ثبت نشده</td></tr>`}</tbody>
    </table>`;
  }
}