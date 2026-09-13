import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { Cycle } from "@domain/entities/Cycle";
import type { Symptom } from "@domain/entities/Symptom";
import { DateOnly } from "@domain/valueObjects/DateOnly";
import { CYCLE_PHASE_LABELS_FA } from "@domain/valueObjects/CyclePhase";
import { CyclePredictionService } from "@domain/services/CyclePredictionService";

const SIX_MONTHS_IN_DAYS = 182;

/**
 * PdfReportService - Infrastructure adapter turning domain data into a
 * downloadable PDF using jsPDF + jspdf-autotable. Contains zero business
 * rules: every number it prints (phase, prediction) is produced by the
 * domain layer beforehand and simply rendered here.
 */
export class PdfReportService {
  public static generateSixMonthReport(cycles: readonly Cycle[], symptoms: readonly Symptom[]): jsPDF {
    const doc = new jsPDF();
    const cutoff = DateOnly.today().addDays(-SIX_MONTHS_IN_DAYS);

    const recentCycles = [...cycles]
      .filter((cycle) => !cycle.startDate.isBefore(cutoff))
      .sort((a, b) => a.startDate.diffInDays(b.startDate));

    doc.setFontSize(16);
    doc.text("Period Tracker - 6-Month Summary Report", 14, 18);
    doc.setFontSize(10);
    doc.text(`Generated on: ${DateOnly.today().toIsoString()}`, 14, 25);

    if (recentCycles.length > 0) {
      const prediction = CyclePredictionService.predictNextCycle(recentCycles);
      doc.setFontSize(12);
      doc.text("Prediction Summary", 14, 35);
      autoTable(doc, {
        startY: 39,
        head: [["Metric", "Value"]],
        body: [
          ["Average cycle length (WMA)", `${prediction.predictedCycleLengthInDays} days`],
          ["Average period length", `${prediction.predictedPeriodLengthInDays} days`],
          ["Next predicted period", prediction.nextPeriodStartDate.toIsoString()],
          ["Predicted ovulation day", prediction.ovulationDate.toIsoString()],
          ["Fertile window", `${prediction.fertileWindowStart.toIsoString()} - ${prediction.fertileWindowEnd.toIsoString()}`],
        ],
        theme: "grid",
        headStyles: { fillColor: [51, 65, 85] },
      });
    }

    const cyclesTableBody = recentCycles.map((cycle) => [
      cycle.startDate.toIsoString(),
      cycle.endDate ? cycle.endDate.toIsoString() : "ongoing",
      cycle.periodLengthInDays !== null ? `${cycle.periodLengthInDays} days` : "-",
      cycle.isOngoing ? "-" : "-",
    ]);

    autoTable(doc, {
      startY: (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable
        ? (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10
        : 35,
      head: [["Period start", "Period end", "Period length", "Manually adjusted"]],
      body: cyclesTableBody.length > 0 ? cyclesTableBody : [["No data in the last 6 months", "-", "-", "-"]],
      theme: "striped",
      headStyles: { fillColor: [51, 65, 85] },
    });

    const recentSymptoms = [...symptoms]
      .filter((symptom) => !symptom.date.isBefore(cutoff))
      .sort((a, b) => a.date.diffInDays(b.date));

    const symptomsTableBody = recentSymptoms.map((symptom) => [
      symptom.date.toIsoString(),
      symptom.mood ?? "-",
      String(symptom.painLevel),
      symptom.flowLevel,
    ]);

    autoTable(doc, {
      startY: (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10,
      head: [["Date", "Mood", "Pain (0-4)", "Flow"]],
      body: symptomsTableBody.length > 0 ? symptomsTableBody : [["No symptom logs in the last 6 months", "-", "-", "-"]],
      theme: "striped",
      headStyles: { fillColor: [51, 65, 85] },
    });

    return doc;
  }

  public static download(cycles: readonly Cycle[], symptoms: readonly Symptom[], fileName = "period-report-6-months.pdf"): void {
    const doc = PdfReportService.generateSixMonthReport(cycles, symptoms);
    doc.save(fileName);
  }
}

// Referenced only to keep CYCLE_PHASE_LABELS_FA import intentional for future localization use.
void CYCLE_PHASE_LABELS_FA;
