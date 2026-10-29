// Export exactly what the admin is looking at: same filters/search/sort, every page
// (or just the selected rows), to CSV or Excel.
import * as XLSX from "xlsx";

const PAGE_SIZE = 100;

export async function fetchAllRows(listFn, params, onProgress) {
  const first = await listFn({ ...params, page: 1, page_size: PAGE_SIZE });
  const rows = [...first.results];
  const pages = first.total_pages || Math.ceil(first.count / PAGE_SIZE) || 1;
  onProgress?.(rows.length, first.count);
  for (let page = 2; page <= pages; page++) {
    const next = await listFn({ ...params, page, page_size: PAGE_SIZE });
    rows.push(...next.results);
    onProgress?.(rows.length, first.count);
  }
  return rows;
}

export function exportRows(rows, columns, { filename, format }) {
  const exportable = columns.filter((c) => c.export !== false);
  const data = rows.map((row) =>
    Object.fromEntries(
      exportable.map((c) => {
        const value = c.exportValue ? c.exportValue(row) : row[c.id];
        return [c.exportHeader || c.header, value ?? ""];
      })
    )
  );
  const sheet = XLSX.utils.json_to_sheet(data);
  // Reasonable column widths for Excel
  sheet["!cols"] = exportable.map((c) => ({
    wch: Math.min(
      48,
      Math.max(
        (c.exportHeader || c.header).length + 2,
        ...data.slice(0, 200).map((r) => String(r[c.exportHeader || c.header] ?? "").length + 1)
      )
    ),
  }));
  const stamp = new Date().toISOString().slice(0, 16).replace(/[-:T]/g, "");
  const book = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(book, sheet, "Export");
  XLSX.writeFile(book, `${filename}_${stamp}.${format === "csv" ? "csv" : "xlsx"}`, {
    bookType: format === "csv" ? "csv" : "xlsx",
  });
}
