import type { Major } from "@/types/domain";

// Chi phí sau tốt nghiệp (F6) — chỉ hiện khi ngành yêu cầu chứng chỉ hành
// nghề. `post_grad_requirements` đang rỗng ở BE nên KHÔNG có số liệu thật:
// hiện khung + ghi chú rõ, không ẩn hẳn (owner chốt ở brainstorm) và không
// throw khi `practiceProfession` null dù đó là invariant chưa được DB ràng buộc.
export default function PostGradCostBlock({ major }: { major: Major }) {
  if (!major.requiresPracticeLicense) return null;

  return (
    <div className="rounded-xl border border-border bg-surface p-4 text-sm">
      <div className="mb-1 font-semibold text-ink">
        Chi phí hành nghề sau tốt nghiệp
        {major.practiceProfession ? ` — ${major.practiceProfession}` : ""}
      </div>
      <p className="text-ink-3">
        Ngành này yêu cầu chứng chỉ hành nghề sau khi tốt nghiệp (đào tạo nghề,
        tập sự, thi chứng chỉ...), nhưng hiện <b>chưa có số liệu thật</b> về
        khoản chi phí này — tổng học phí ở trên chưa bao gồm.
      </p>
    </div>
  );
}
