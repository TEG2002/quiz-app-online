import { google } from "googleapis";

const QUESTIONS_TAB = process.env.QUESTIONS_SHEET || "Sheet1";
const RESULTS_TAB = process.env.RESULTS_SHEET || "Results";

function client() {
  const auth = new google.auth.JWT({
    email: process.env.GOOGLE_CLIENT_EMAIL,
    key: (process.env.GOOGLE_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  return google.sheets({ version: "v4", auth });
}

// รับเฉลยเป็น ก ข ค ง / A-D / 1-4 แล้วแปลงเป็น index 0-3
function parseAnswer(v) {
  const s = String(v ?? "").trim().toUpperCase().replace(/[.\s]/g, "");
  const thai = "กขคง".indexOf(s);
  if (s && thai >= 0) return thai;
  if (s && "ABCD".includes(s)) return "ABCD".indexOf(s);
  const n = parseInt(s, 10);
  return n >= 1 && n <= 4 ? n - 1 : -1;
}

// คอลัมน์: A=ข้อ B=คำถาม C-F=ตัวเลือก ก-ง G=เฉลย H=คำตอบที่ถูก (ไม่ใช้) I=คำอธิบาย (ไม่บังคับ)
export async function getQuestions() {
  const res = await client().spreadsheets.values.get({
    spreadsheetId: process.env.SHEET_ID,
    range: `${QUESTIONS_TAB}!A2:I`,
  });
  return (res.data.values || [])
    .filter((r) => r[1] && r[2] && r[3] && r[4] && r[5])
    .map((r, i) => ({
      id: i,
      question: r[1],
      choices: [r[2], r[3], r[4], r[5]],
      answer: parseAnswer(r[6]),
      explanation: r[8] || "",
    }));
}

// แท็บ Results: เวลา | รหัสนักศึกษา | ชื่อ | คะแนน | เต็ม
export async function saveResult(studentId, name, score, total) {
  await client().spreadsheets.values.append({
    spreadsheetId: process.env.SHEET_ID,
    range: `${RESULTS_TAB}!A:E`,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [[
        new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" }),
        studentId || "-",
        name,
        score,
        total
      ]],
    },
  });
}
