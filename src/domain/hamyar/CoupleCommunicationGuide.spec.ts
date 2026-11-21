import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import type { HamyarGuideData } from "./HamyarGuide";

describe("Couple Communication Guide JSON", () => {
  const filePath = path.resolve(process.cwd(), "public/help/mahak_couple_communication_guide.json");

  it("exists and is valid JSON matching HamyarGuideData schema", () => {
    expect(fs.existsSync(filePath)).toBe(true);
    const content = fs.readFileSync(filePath, "utf-8");
    const data = JSON.parse(content) as HamyarGuideData;

    expect(data.schema_version).toBe("1.0");
    expect(data.guide_id).toBe("couple_communication");
    expect(data.stages).toHaveLength(13);
  });

  it("covers all required stages and topics comprehensively", () => {
    const content = fs.readFileSync(filePath, "utf-8");
    const data = JSON.parse(content) as HamyarGuideData;

    const titles = data.stages.map((s) => s.title);

    // Stage 1: Differences
    expect(titles[0]).toContain("تفاوت‌های بنیادین");
    // Stage 2: For Men
    expect(titles[1]).toContain("آقایان");
    // Stage 3: For Women
    expect(titles[2]).toContain("خانم‌ها");
    // Stage 4: Little opposite-sex interaction / without sister or brother
    expect(titles[3]).toContain("تجربه ارتباطی محدود");
    // Stage 5: How to talk and conflict resolution
    expect(titles[4]).toContain("هنر گفت‌وگو");
    // Stage 6: Do's and Don'ts
    expect(titles[5]).toContain("بایدها و نبایدهای قطعی");
    // Stage 7: Showing affection and love
    expect(titles[6]).toContain("ابراز توجه، محبت و عاطفه");
  });

  it("ensures every stage has goal, knowledge, checklist, myths, red flags, and quiz", () => {
    const content = fs.readFileSync(filePath, "utf-8");
    const data = JSON.parse(content) as HamyarGuideData;

    for (const stage of data.stages) {
      expect(stage.goal).toBeTruthy();
      expect(stage.knowledge.length).toBeGreaterThan(0);
      expect(stage.practical_checklist.length).toBeGreaterThan(0);
      expect(stage.common_mistakes_and_myths.length).toBeGreaterThan(0);
      expect(stage.red_flags.length).toBeGreaterThan(0);
      expect(stage.quiz?.questions.length).toBeGreaterThan(0);
      expect(stage.quiz?.answers.length).toBeGreaterThan(0);
    }
  });
});
