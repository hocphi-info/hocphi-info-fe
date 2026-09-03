// Server Component — placeholder sort control. Disabled for Week 1; wired up in
// Week 3 (F4). The mockup splits this into a criterion button + a direction
// toggle; Week 1 keeps a single <select> for simplicity.
// TODO Tuần 3: tách sortcat + sortdir như mockup/Main.dc.html.

const OPTIONS = [
  "Học phí năm đầu",
  "Tổng cả khoá",
  "Tốc độ tăng",
  "Tên trường (A–Z)",
];

export default function SortDropdown() {
  return (
    <label className="flex items-center gap-2 text-sm text-ink-2">
      Sắp xếp theo:
      <select
        disabled
        defaultValue={OPTIONS[0]}
        className="rounded-md border border-border bg-surface px-2 py-1 text-ink-2"
      >
        {OPTIONS.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </label>
  );
}
