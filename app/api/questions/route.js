import { readFile } from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

// อ่านจาก data/questions.json — รวมทุกข้อและซ่อนเฉลย
export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "data", "questions.json");
    const raw = await readFile(filePath, "utf-8");
    const chapters = JSON.parse(raw.replace(/^\uFEFF/, ""));

    // รวมคำถามทั้งหมดจากทุกบท
    const questions = chapters.flatMap((c) =>
      c.questions.map(({ id, question, choices }) => ({ id, question, choices }))
    );

    return Response.json(questions);
  } catch (e) {
    console.error(e);
    return Response.json({ error: "โหลดข้อสอบไม่สำเร็จ" }, { status: 500 });
  }
}
