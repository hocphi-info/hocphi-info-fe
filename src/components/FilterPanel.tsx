"use client";

// Client Component — the filter panel.
//
// Week 1 scope: the controls are REAL form elements wrapped in <fieldset disabled>
// so they are visible but inert. Week 3 removes `disabled` and wires state + URL
// sync. The only live state here is `mobileOpen` (useState #3) — whether the
// panel is shown on small screens.
//
// Groups are laid out as collapsible sections in the mockup; Week 1 leaves them
// all open and does NOT add per-section state (YAGNI).

import { useState } from "react";
import type {
  CityCode,
  MajorGroupCode,
  SchoolCategory,
  Track,
} from "@/types/domain";

const CITY_OPTIONS: { value: CityCode; label: string }[] = [
  { value: "HCM", label: "TP.HCM" },
  { value: "HN", label: "Hà Nội" },
];

const GROUP_OPTIONS: { value: MajorGroupCode; label: string }[] = [
  { value: "CNTT", label: "CNTT / KHMT / AI / KHDL" },
  { value: "KY_THUAT", label: "Kỹ thuật" },
  { value: "KINH_TE", label: "Kinh tế – Tài chính – QTKD" },
  { value: "Y_DUOC", label: "Y – Dược" },
  { value: "LUAT", label: "Luật" },
  { value: "LOGISTICS", label: "Logistics" },
];

const TRACK_OPTIONS: { value: Track; label: string }[] = [
  { value: "dai_tra", label: "Đại trà" },
  { value: "chat_luong_cao", label: "Chất lượng cao" },
  { value: "tien_tien", label: "Tiên tiến" },
  { value: "quoc_te", label: "Quốc tế / liên kết" },
];

const CATEGORY_OPTIONS: { value: SchoolCategory; label: string }[] = [
  { value: "cong_lap", label: "Công lập" },
  { value: "cong_lap_tu_chu", label: "Công lập tự chủ" },
  { value: "tu_thuc", label: "Tư thục" },
  { value: "tu_thuc_von_nuoc_ngoai", label: "Tư thục · 100% vốn nước ngoài" },
];

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-rule py-3 last:border-b-0">
      <p className="mb-2 text-sm font-semibold text-ink">{title}</p>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function CheckboxRow({ label }: { label: string }) {
  return (
    <label className="flex items-center gap-2 text-sm text-ink-2">
      <input type="checkbox" className="size-4 accent-[var(--accent)]" />
      {label}
    </label>
  );
}

function PanelBody({ screen }: { screen: "nganh" | "truong" }) {
  return (
    // Everything inert for Week 1.
    <fieldset disabled className="space-y-1">
      <Section title="Thành phố">
        {CITY_OPTIONS.map((o) => (
          <CheckboxRow key={o.value} label={o.label} />
        ))}
      </Section>

      {screen === "nganh" && (
        <Section title="Nhóm ngành">
          {GROUP_OPTIONS.map((o) => (
            <CheckboxRow key={o.value} label={o.label} />
          ))}
        </Section>
      )}

      {screen === "nganh" && (
        <Section title="Hệ đào tạo">
          {TRACK_OPTIONS.map((o) => (
            <CheckboxRow key={o.value} label={o.label} />
          ))}
        </Section>
      )}

      <Section title="Loại trường">
        {CATEGORY_OPTIONS.map((o) => (
          <CheckboxRow key={o.value} label={o.label} />
        ))}
      </Section>

      {screen === "truong" && (
        <Section title="Cơ sở tính khoảng">
          <label className="flex items-center gap-2 text-sm text-ink-2">
            <input
              type="radio"
              name="range-basis"
              defaultChecked
              className="size-4 accent-[var(--accent)]"
            />
            Chỉ hệ đại trà
          </label>
          <label className="flex items-center gap-2 text-sm text-ink-2">
            <input
              type="radio"
              name="range-basis"
              className="size-4 accent-[var(--accent)]"
            />
            Gồm cả CLC – tiên tiến
          </label>
        </Section>
      )}

      {screen === "truong" && (
        <Section title="Có đào tạo nhóm ngành">
          {GROUP_OPTIONS.map((o) => (
            <CheckboxRow key={o.value} label={o.label} />
          ))}
        </Section>
      )}

      <Section
        title={
          screen === "nganh"
            ? "Học phí năm đầu (triệu/năm)"
            : "Học phí thấp nhất (triệu/năm)"
        }
      >
        <input
          type="range"
          min={0}
          max={350}
          defaultValue={350}
          className="w-full accent-[var(--accent)]"
        />
        <p className="text-xs text-ink-3">0 – 350 tr</p>
      </Section>

      {screen === "nganh" && (
        <Section title="Lộ trình tăng">
          <label className="flex items-center gap-2 text-sm text-ink-2">
            <input type="checkbox" className="size-4 accent-[var(--accent)]" />
            Chỉ trường công bố lộ trình
          </label>
        </Section>
      )}
    </fieldset>
  );
}

export default function FilterPanel({
  screen,
}: {
  screen: "nganh" | "truong";
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Desktop: sticky sidebar, always visible */}
      <aside className="sticky top-4 hidden h-fit rounded-lg border border-border bg-surface p-4 lg:block">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-base font-semibold text-ink">Bộ lọc</p>
          <button
            type="button"
            disabled
            className="text-sm text-accent-ink opacity-60"
          >
            Đặt lại
          </button>
        </div>
        <PanelBody screen={screen} />
      </aside>

      {/* Mobile: a button that toggles the panel */}
      <div className="lg:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen((open) => !open)}
          aria-expanded={mobileOpen}
          className="w-full rounded-lg border border-border bg-surface px-4 py-2 text-left text-sm font-semibold text-ink"
        >
          {mobileOpen ? "Ẩn bộ lọc" : "Bộ lọc"}
        </button>
        {mobileOpen && (
          <div className="mt-2 rounded-lg border border-border bg-surface p-4">
            <PanelBody screen={screen} />
          </div>
        )}
      </div>
    </>
  );
}
