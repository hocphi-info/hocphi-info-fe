"use client";

// Client Component — the filter panel (F3). Week 1 shipped the controls inside
// <fieldset disabled>; Week 3 makes them live. Every control is CONTROLLED from
// the URL: its checked/value state is read from useSearchParams, and changing it
// writes a new query string via history.pushState (no server round-trip).
//
// Learning note (vs Flutter): a controlled <input> is like a TextField whose
// `value` comes from a controller you own — React does not let the DOM keep its
// own state. The "controller" here is the URL.
//
// pushState for discrete toggles (checkbox/radio); replaceState for the range
// slider, so dragging it doesn't fill the browser history.

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import type {
  CityCode,
  MajorGroupCode,
  SchoolCategory,
  Track,
} from "@/types/domain";
import { setOne, toggleMulti, writeParams } from "@/lib/url";

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

const MAX_SLIDER = 350;

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

function PanelBody({ screen }: { screen: "nganh" | "truong" }) {
  const sp = useSearchParams();

  // --- read current state from the URL ---
  const cities = sp.getAll("city");
  const groups = sp.getAll("group");
  const tracks = sp.getAll("track");
  const cats = sp.getAll("cat");
  const roadmapOn = sp.get("roadmap") === "1";
  const basisAll = sp.get("basis") === "all";
  const maxRaw = sp.get("max");
  const maxValue =
    maxRaw != null && Number(maxRaw) > 0 ? Number(maxRaw) : MAX_SLIDER;

  // --- writers ---
  const toggle = (key: string, value: string) =>
    writeParams(
      toggleMulti(new URLSearchParams(sp.toString()), key, value),
      "push",
    );

  const setRoadmap = (on: boolean) =>
    writeParams(
      setOne(new URLSearchParams(sp.toString()), "roadmap", on ? "1" : null),
      "push",
    );

  const setBasis = (all: boolean) =>
    writeParams(
      setOne(new URLSearchParams(sp.toString()), "basis", all ? "all" : null),
      "push",
    );

  const setMax = (value: number) =>
    writeParams(
      setOne(
        new URLSearchParams(sp.toString()),
        "max",
        value >= MAX_SLIDER ? null : String(value),
      ),
      // replaceState: dragging the slider must not spam browser history
      "replace",
    );

  function MultiRow({
    checked,
    onToggle,
    label,
  }: {
    checked: boolean;
    onToggle: () => void;
    label: string;
  }) {
    return (
      <label className="flex items-center gap-2 text-sm text-ink-2">
        <input
          type="checkbox"
          checked={checked}
          onChange={onToggle}
          className="size-4 accent-accent"
        />
        {label}
      </label>
    );
  }

  return (
    <div className="space-y-1">
      <Section title="Thành phố">
        {CITY_OPTIONS.map((o) => (
          <MultiRow
            key={o.value}
            checked={cities.includes(o.value)}
            onToggle={() => toggle("city", o.value)}
            label={o.label}
          />
        ))}
      </Section>

      {screen === "nganh" && (
        <Section title="Nhóm ngành">
          {GROUP_OPTIONS.map((o) => (
            <MultiRow
              key={o.value}
              checked={groups.includes(o.value)}
              onToggle={() => toggle("group", o.value)}
              label={o.label}
            />
          ))}
        </Section>
      )}

      {screen === "nganh" && (
        <Section title="Hệ đào tạo">
          {TRACK_OPTIONS.map((o) => (
            <MultiRow
              key={o.value}
              checked={tracks.includes(o.value)}
              onToggle={() => toggle("track", o.value)}
              label={o.label}
            />
          ))}
        </Section>
      )}

      <Section title="Loại trường">
        {CATEGORY_OPTIONS.map((o) => (
          <MultiRow
            key={o.value}
            checked={cats.includes(o.value)}
            onToggle={() => toggle("cat", o.value)}
            label={o.label}
          />
        ))}
      </Section>

      {screen === "truong" && (
        <Section title="Cơ sở tính khoảng">
          <label className="flex items-center gap-2 text-sm text-ink-2">
            <input
              type="radio"
              name="range-basis"
              checked={!basisAll}
              onChange={() => setBasis(false)}
              className="size-4 accent-accent"
            />
            Chỉ hệ đại trà
          </label>
          <label className="flex items-center gap-2 text-sm text-ink-2">
            <input
              type="radio"
              name="range-basis"
              checked={basisAll}
              onChange={() => setBasis(true)}
              className="size-4 accent-accent"
            />
            Gồm cả CLC – tiên tiến
          </label>
        </Section>
      )}

      {screen === "truong" && (
        <Section title="Có đào tạo nhóm ngành">
          {GROUP_OPTIONS.map((o) => (
            <MultiRow
              key={o.value}
              checked={groups.includes(o.value)}
              onToggle={() => toggle("group", o.value)}
              label={o.label}
            />
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
          max={MAX_SLIDER}
          value={maxValue}
          onChange={(e) => setMax(Number(e.target.value))}
          className="w-full accent-accent"
        />
        <p className="text-xs text-ink-3">
          {maxValue >= MAX_SLIDER ? "Không giới hạn" : `≤ ${maxValue} tr`}
        </p>
      </Section>

      {screen === "nganh" && (
        <Section title="Lộ trình tăng">
          <label className="flex items-center gap-2 text-sm text-ink-2">
            <input
              type="checkbox"
              checked={roadmapOn}
              onChange={(e) => setRoadmap(e.target.checked)}
              className="size-4 accent-accent"
            />
            Chỉ trường công bố lộ trình
          </label>
        </Section>
      )}
    </div>
  );
}

function ResetButton() {
  const sp = useSearchParams();
  const hasAny = sp.toString().length > 0;
  return (
    <button
      type="button"
      disabled={!hasAny}
      onClick={() => writeParams(new URLSearchParams(), "push")}
      className="text-sm text-accent-ink disabled:opacity-40"
    >
      Đặt lại
    </button>
  );
}

export default function FilterPanel({
  screen,
}: {
  screen: "nganh" | "truong";
}) {
  // The only local state left: whether the panel is open on small screens.
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Desktop: sticky sidebar, always visible */}
      <aside className="sticky top-4 hidden h-fit rounded-lg border border-border bg-surface p-4 lg:block">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-base font-semibold text-ink">Bộ lọc</p>
          <ResetButton />
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
            <div className="mb-2 flex justify-end">
              <ResetButton />
            </div>
            <PanelBody screen={screen} />
          </div>
        )}
      </div>
    </>
  );
}
