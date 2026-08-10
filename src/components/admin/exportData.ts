// Shared CSV / PDF export helpers for admin tables.
// PDF export is a lightweight print-friendly HTML → browser print flow
// (no extra dependency), matching the "Export PDF" affordance already used
// across the admin deposits/withdrawals pages.
import { toast } from "sonner";

export function exportCsv(filename: string, headers: string[], rows: (string | number)[][]) {
  const escape = (v: string | number) => {
    const s = String(v ?? "");
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = [headers, ...rows].map((r) => r.map(escape).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  link.click();
  URL.revokeObjectURL(url);
  toast.success("CSV exported");
}

export function exportPdf(title: string, headers: string[], rows: (string | number)[][]) {
  const win = window.open("", "_blank", "width=900,height=700");
  if (!win) {
    toast.error("Allow pop-ups to export PDF");
    return;
  }
  const style = `
    body { font-family: Arial, Helvetica, sans-serif; padding: 24px; color: #111; }
    h1 { font-size: 18px; margin-bottom: 4px; }
    p { color: #555; font-size: 12px; margin-top: 0; }
    table { width: 100%; border-collapse: collapse; margin-top: 16px; }
    th, td { border: 1px solid #ddd; padding: 6px 8px; font-size: 11px; text-align: left; }
    th { background: #f3f1ea; text-transform: uppercase; }
  `;
  const body = `
    <h1>${title}</h1>
    <p>Generated ${new Date().toLocaleString("en-NG")}</p>
    <table>
      <thead><tr>${headers.map((h) => `<th>${h}</th>`).join("")}</tr></thead>
      <tbody>${rows.map((r) => `<tr>${r.map((c) => `<td>${c ?? ""}</td>`).join("")}</tr>`).join("")}</tbody>
    </table>
  `;
  win.document.write(`<html><head><title>${title}</title><style>${style}</style></head><body>${body}</body></html>`);
  win.document.close();
  win.focus();
  win.print();
  toast.success("PDF export ready");
}
