/** Quote every cell and neutralize spreadsheet formulas, including whitespace prefixes. */
export function csvCell(value: unknown): string {
  let text = value == null ? "" : typeof value === "object" ? JSON.stringify(value) : String(value);
  if (/^[\s\u0000-\u001f]*[=+@-]/u.test(text) || /^[\t\r\n]/u.test(text)) text = "'" + text;
  return '"' + text.replaceAll('"', '""') + '"';
}
export function toCsv(rows: Record<string, unknown>[], columns: readonly string[]): string {
  return (
    [
      columns.map(csvCell).join(","),
      ...rows.map((row) => columns.map((key) => csvCell(row[key])).join(",")),
    ].join("\r\n") + "\r\n"
  );
}
