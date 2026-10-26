import questionsData from "@/data/questions.json";

export const dynamic = "force-dynamic";

// รวมทุกข้อและซ่อนเฉลย
export async function GET() {
  try {
    const questions = questionsData.flatMap((c) =>
      c.questions.map(({ id, question, choices }) => ({ id, question, choices }))
    );

    return Response.json(questions);
  } catch (e) {
    console.error(e);
    return Response.json({ error: "โหลดข้อสอบไม่สำเร็จ" }, { status: 500 });
  }
}

