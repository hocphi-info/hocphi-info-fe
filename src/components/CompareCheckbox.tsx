"use client";

// Client Component — one checkbox per result row. It has no state of its own; it
// reads and writes the shared selection from CompareTray via the useCompare hook.
// When the list is full, unselected checkboxes are disabled with an explanatory
// tooltip.

import { useCompare } from "@/components/CompareTray";

export default function CompareCheckbox({
  id,
  label,
}: {
  id: string;
  label: string;
}) {
  const { isSelected, toggle, count, max } = useCompare();
  const checked = isSelected(id);
  const disabled = !checked && count >= max;

  return (
    <input
      type="checkbox"
      checked={checked}
      disabled={disabled}
      onChange={() => toggle(id)}
      aria-label={`Chọn để so sánh: ${label}`}
      title={disabled ? `Chỉ so sánh tối đa ${max} mục` : undefined}
      className="size-4 accent-accent disabled:opacity-40"
    />
  );
}
