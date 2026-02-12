import { NextRequest, NextResponse } from "next/server";

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
const MAX_TEXT_LENGTH = 30000;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File too large (max 20MB)" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    let text = "";

    const ext = file.name.toLowerCase().split(".").pop() || "";
    const mimeType = file.type;

    // PDF
    if (mimeType === "application/pdf" || ext === "pdf") {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const pdfParse = require("pdf-parse") as (data: Buffer) => Promise<{ text: string }>;
      const result = await pdfParse(buffer);
      text = result.text;
    }
    // DOCX
    else if (
      mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      ext === "docx"
    ) {
      const mammoth = await import("mammoth");
      const result = await mammoth.extractRawText({ buffer });
      text = result.value;
    }
    // XLSX / XLS
    else if (
      mimeType === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      mimeType === "application/vnd.ms-excel" ||
      ext === "xlsx" ||
      ext === "xls"
    ) {
      const XLSX = await import("xlsx");
      const workbook = XLSX.read(buffer, { type: "buffer" });
      const parts: string[] = [];
      for (const sheetName of workbook.SheetNames) {
        const sheet = workbook.Sheets[sheetName];
        const csv = XLSX.utils.sheet_to_csv(sheet);
        parts.push(`[${sheetName}]\n${csv}`);
      }
      text = parts.join("\n\n");
    }
    // CSV
    else if (mimeType === "text/csv" || ext === "csv") {
      text = buffer.toString("utf-8");
    }
    // Plain text / code
    else if (
      mimeType.startsWith("text/") ||
      ["txt", "md", "json", "xml", "html", "css", "js", "ts", "py"].includes(ext)
    ) {
      text = buffer.toString("utf-8");
    } else {
      return NextResponse.json(
        { error: "Unsupported file type" },
        { status: 400 }
      );
    }

    // Truncate if too long
    if (text.length > MAX_TEXT_LENGTH) {
      text = text.slice(0, MAX_TEXT_LENGTH) + "\n\n[... truncated]";
    }

    return NextResponse.json({ text: text.trim() });
  } catch (err) {
    console.error("File processing error:", err);
    return NextResponse.json({ error: "Failed to process file" }, { status: 500 });
  }
}
