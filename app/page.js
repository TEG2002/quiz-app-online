"use client";
import { useState } from "react";

const LABELS = ["ก", "ข", "ค", "ง"];

export default function Page() {
  const [stage, setStage] = useState("start"); // start | quiz | result
  const [studentId, setStudentId] = useState("");
  const [name, setName] = useState("");
  const [qs, setQs] = useState([]);
  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function start() {
    setBusy(true); setError("");
    try {
      const res = await fetch("/api/questions", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      if (!data.length) throw new Error("ยังไม่มีข้อสอบในไฟล์");
      setQs(data); setI(0); setAnswers({}); setStage("quiz");
    } catch (e) { setError(e.message); }
    setBusy(false);
  }

  async function submit() {
    setBusy(true); setError("");
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: studentId.trim(), name: name.trim(), answers }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(data); setStage("result");
    } catch (e) { setError(e.message); }
    setBusy(false);
  }

  // ── หน้าเริ่มต้น ──────────────────────────────────────────────
  if (stage === "start") {
    return (
      <main>
        <div className="avatar-wrapper">
          <img src="/instructor.png" alt="อาจารย์ผู้สอน" className="avatar-img" />
        </div>
        <h1>แบบทดสอบออนไลน์</h1>
        <p className="sub">กรอกรหัสนักศึกษาและชื่อ-นามสกุล เพื่อเริ่มทำข้อสอบ (ทั้งหมด {qs.length || 20} ข้อ)</p>
        <input
          id="student-id-input"
          type="text"
          placeholder="รหัสนักศึกษา"
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
        />
        <input
          id="name-input"
          type="text"
          placeholder="ชื่อ-นามสกุล"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && studentId.trim() && name.trim() && !busy && start()}
        />
        <button id="btn-start" onClick={start} disabled={!studentId.trim() || !name.trim() || busy}>
          {busy ? "กำลังโหลด…" : "เริ่มทำข้อสอบ"}
        </button>
        {error && <p className="err">{error}</p>}
      </main>
    );
  }

  // ── หน้าสอบ ───────────────────────────────────────────────────
  if (stage === "quiz") {
    const q = qs[i];
    const last = i === qs.length - 1;
    const picked = answers[q.id];
    return (
      <main>
        <div className="bar"><i style={{ width: `${((i + 1) / qs.length) * 100}%` }} /></div>
        <div className="count">ข้อ {i + 1} จาก {qs.length}</div>
        <h2 className="q">{q.question}</h2>
        <div className="choices">
          {q.choices.map((c, k) => (
            <button key={k} className={`choice ${picked === k ? "on" : ""}`} onClick={() => setAnswers({ ...answers, [q.id]: k })}>
              <b>{LABELS[k]}.</b> <span>{c}</span>
            </button>
          ))}
        </div>
        <div className="actions">
          <button className="ghost" onClick={() => setI(i - 1)} disabled={i === 0}>ย้อนกลับ</button>
          {last
            ? <button onClick={submit} disabled={picked === undefined || busy}>{busy ? "กำลังส่ง…" : "ส่งคำตอบ"}</button>
            : <button onClick={() => setI(i + 1)} disabled={picked === undefined}>ข้อถัดไป</button>}
        </div>
        {error && <p className="err">{error}</p>}
      </main>
    );
  }

  // ── หน้าผลลัพธ์ ───────────────────────────────────────────────
  return (
    <main>
      <h1>ผลคะแนนของ {name} {studentId ? `(${studentId})` : ""}</h1>
      <div className="score">{result.score}/{result.total}</div>
      {qs.map((q, n) => {
        const r = result.review.find((x) => x.id === q.id);
        return (
          <div className="item" key={q.id}>
            <h2 className="q">{n + 1}. {q.question}</h2>
            <div className="choices">
              {q.choices.map((c, k) => (
                <div key={k} className={`choice ${k === r.correct ? "right" : k === r.picked ? "wrong" : ""}`}>
                  <b>{LABELS[k]}.</b> <span>{c}</span>
                </div>
              ))}
            </div>
            {r.explanation && <p className="note">{r.explanation}</p>}
          </div>
        );
      })}
      <button onClick={() => { setStage("start"); setResult(null); }}>ทำใหม่</button>
    </main>
  );
}


