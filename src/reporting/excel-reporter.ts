import type {
  Reporter,
  FullConfig,
  Suite,
  FullResult,
} from "@playwright/test/reporter";
import ExcelJS from "exceljs";
import path from "path";
import fs from "fs";

const REPORT_PATH = path.join("reports", "QA_Status_Report.xlsx");

const STATUS_COLORS: Record<string, string> = {
  Passed: "FFC6EFCE",
  Failed: "FFFFC7CE",
  Flaky: "FFFFEB9C",
  Skipped: "FFD9D9D9",
};

export default class ExcelStatusReporter implements Reporter {
  private suite!: Suite;
  private startTime = 0;

  onBegin(config: FullConfig, suite: Suite) {
    this.suite = suite;
    this.startTime = Date.now();
  }

  async onEnd(result: FullResult) {
    const workbook = new ExcelJS.Workbook();
    const fileExists = fs.existsSync(REPORT_PATH);

    if (fileExists) {
      await workbook.xlsx.readFile(REPORT_PATH);
    } else {
      fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
    }

    const summarySheet = this.getOrCreateSummarySheet(workbook);
    const detailSheet = this.getOrCreateDetailSheet(workbook);

    const runId = new Date().toISOString();
    const allTests = this.suite.allTests();

    let passed = 0,
      failed = 0,
      flaky = 0,
      skipped = 0;

    for (const test of allTests) {
      const outcome = test.outcome();
      const status = this.mapOutcome(outcome);
      if (status === "Passed") passed++;
      else if (status === "Failed") failed++;
      else if (status === "Flaky") flaky++;
      else skipped++;

      const lastResult = test.results[test.results.length - 1];
      const row = detailSheet.addRow([
        runId,
        test.parent.title,
        test.title,
        status,
        test.parent.project()?.name ?? "unknown",
        lastResult ? `${lastResult.duration}ms` : "n/a",
        lastResult?.retry ?? 0,
        lastResult?.error?.message?.slice(0, 200) ?? "",
      ]);
      this.colorRow(row, status);
    }

    const durationSec = ((Date.now() - this.startTime) / 1000).toFixed(1);
    const totalTests = allTests.length;
    const passRate =
      totalTests > 0 ? ((passed / totalTests) * 100).toFixed(1) : "0.0";

    const summaryRow = summarySheet.addRow([
      runId,
      process.env.CI ? process.env.CI_PLATFORM || "CI" : "Local",
      totalTests,
      passed,
      failed,
      flaky,
      skipped,
      `${passRate}%`,
      `${durationSec}s`,
    ]);
    const overallStatus =
      failed > 0 ? "Failed" : flaky > 0 ? "Flaky" : "Passed";
    this.colorRow(summaryRow, overallStatus);

    await workbook.xlsx.writeFile(REPORT_PATH);
    console.log(`\n📊 QA Status Report updated: ${REPORT_PATH}`);
    console.log(
      `   Run: ${passed} passed, ${failed} failed, ${flaky} flaky, ${skipped} skipped (${passRate}% pass rate)\n`,
    );
  }

  private mapOutcome(
    outcome: string,
  ): "Passed" | "Failed" | "Flaky" | "Skipped" {
    if (outcome === "expected") return "Passed";
    if (outcome === "unexpected") return "Failed";
    if (outcome === "flaky") return "Flaky";
    return "Skipped";
  }

  private colorRow(row: ExcelJS.Row, status: string) {
    const color = STATUS_COLORS[status] ?? "FFFFFFFF";
    row.eachCell((cell) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: color },
      };
    });
  }

  private getOrCreateSummarySheet(
    workbook: ExcelJS.Workbook,
  ): ExcelJS.Worksheet {
    let sheet = workbook.getWorksheet("Summary");
    if (!sheet) {
      sheet = workbook.addWorksheet("Summary", {
        views: [{ state: "frozen", ySplit: 1 }],
      });
      sheet.addRow([
        "Run Timestamp",
        "Environment",
        "Total Tests",
        "Passed",
        "Failed",
        "Flaky",
        "Skipped",
        "Pass Rate",
        "Duration",
      ]);
      sheet.getRow(1).font = { bold: true };
      sheet.columns.forEach((col) => (col.width = 18));
    }
    return sheet;
  }

  private getOrCreateDetailSheet(
    workbook: ExcelJS.Workbook,
  ): ExcelJS.Worksheet {
    let sheet = workbook.getWorksheet("Detailed Results");
    if (!sheet) {
      sheet = workbook.addWorksheet("Detailed Results", {
        views: [{ state: "frozen", ySplit: 1 }],
      });
      sheet.addRow([
        "Run Timestamp",
        "Feature/Suite",
        "Test Case",
        "Status",
        "Browser/Project",
        "Duration",
        "Retries",
        "Error (if any)",
      ]);
      sheet.getRow(1).font = { bold: true };
      sheet.columns.forEach(
        (col, i) => (col.width = i === 2 ? 45 : i === 7 ? 50 : 20),
      );
    }
    return sheet;
  }
}
