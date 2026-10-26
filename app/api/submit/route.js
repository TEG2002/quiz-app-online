import { readFile } from "fs/promises";
import path from "path";
import { saveResult } from "@/lib/sheets";

export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    const { studentId, name, answers } = await req.json();

    // อ่านเฉลยจาก JSON
    const filePath = path.join(process.cwd(), "data", "questions.json");
    const raw = await readFile(filePath, "utf-8");
    const chapters = JSON.parse(raw.replace(/^\uFEFF/, ""));

    // รวมคำถามและเฉลยทั้งหมด
    const qs = chapters.flatMap((c) => c.questions);

    const review = qs.map((q) => ({
      id: q.id,
      picked: answers?.[q.id] ?? -1,
      correct: q.answer,
      explanation: q.explanation,
    }));
    const score = review.filter((r) => r.picked === r.correct).length;

    // บันทึกคะแนนลง Google Sheet ถ้ามีการตั้งค่า SHEET_ID ไว้
    if (process.env.SHEET_ID) {
      try {
        await saveResult(
          String(studentId || "").slice(0, 30),
          String(name || "ไม่ระบุชื่อ").slice(0, 80),
          score,
          qs.length
        );
      } catch (err) {
        console.error("บันทึกลง Google Sheets ไม่สำเร็จ:", err.message);
      }
    }

    return Response.json({ score, total: qs.length, review });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "ส่งคำตอบไม่สำเร็จ" }, { status: 500 });
  }
}

