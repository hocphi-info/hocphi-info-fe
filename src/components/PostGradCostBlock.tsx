import Link from "next/link";
import Callout from "@/components/Callout";
import {
  formatDateVi,
  formatMillions,
  formatMillionsRange,
  formatYearsFromMonths,
} from "@/lib/format";
import type { PostGrad, PostGradStep } from "@/types/domain";

// Chi phí sau tốt nghiệp để hành nghề (F10) — Server Component, rẽ nhánh theo
// DỮ LIỆU `postGrad` của API (không theo `totalWithLicense`):
//   null           -> ngành không cần cấp phép: không render gì
//   steps rỗng     -> cần cấp phép nhưng chưa có số: chỉ cảnh báo, không tổng
//   có steps       -> cảnh báo + bảng các bước + tổng thêm (khoảng min–max)
// Số liệu là lộ trình TỐI THIỂU của NGHỀ (dùng chung mọi trường), không phải
// của riêng trường này — nên nói rõ trong callout. Phí định kỳ (đoàn phí…)
// không phải 1 bước, BE để trong `note` và không cộng vào tổng.

/** "thêm khoảng 2 năm" / "thêm ít nhất khoảng 2 năm" (có bước không cố định thời gian). */
function extraTime(postGrad: PostGrad): string {
  const atLeast = postGrad.hasUnknownDuration ? "ít nhất " : "";
  return `thêm ${atLeast}khoảng ${formatYearsFromMonths(postGrad.totalMonths)}`;
}

function hostname(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

/**
 * Dòng tổng thứ 2 ngay dưới "Tổng học phí cả khoá" của MỖI hệ đào tạo (X khác
 * nhau theo hệ, phần hành nghề thì như nhau). Không cộng gộp X + Y thành 1 số:
 * hai phần đến từ hai nguồn có độ tin cậy khác nhau.
 */
export function LicenseTotalLine({
  postGrad,
  totalCourse,
}: {
  postGrad: PostGrad | null;
  totalCourse: number;
}) {
  if (!postGrad || postGrad.steps.length === 0 || totalCourse <= 0) return null;
  return (
    <p className="text-ink">
      Tổng để hành nghề {postGrad.profession} (ước lượng):{" "}
      <b className="tabular-nums">
        {formatMillions(totalCourse)} +{" "}
        {formatMillionsRange(postGrad.totalCostMin, postGrad.totalCostMax)}
      </b>
      , {extraTime(postGrad)} sau tốt nghiệp.{" "}
      <a href="#chi-phi-hanh-nghe" className="text-accent hover:underline">
        Xem các bước
      </a>
    </p>
  );
}

function durationText(step: PostGradStep): string {
  return step.durationMonths != null
    ? `${step.durationMonths} tháng`
    : "Theo đợt";
}

function Cost({ step }: { step: PostGradStep }) {
  return (
    <>
      {formatMillionsRange(step.costMin, step.costMax)}
      {step.confidence === "estimated" && (
        <span className="ml-1 text-xs font-normal text-ink-3 sm:ml-0 sm:block">
          ước lượng
        </span>
      )}
    </>
  );
}

function SourceLink({ step }: { step: PostGradStep }) {
  if (!step.source) return <span className="text-ink-3">—</span>;
  return (
    <>
      <a
        href={step.source.url}
        target="_blank"
        rel="noreferrer"
        className="break-all text-accent hover:underline"
      >
        {hostname(step.source.url)}
      </a>
      {step.source.publishedDate && (
        <span className="text-ink-3 sm:mt-0.5 sm:block">
          <span className="sm:hidden"> · </span>
          {formatDateVi(step.source.publishedDate)}
        </span>
      )}
    </>
  );
}

// Dưới `sm` chỉ còn cột "Bước": thời gian, chi phí, nguồn xếp ngay dưới tên bước
// (bảng 4 cột ở 375px phải cuộn ngang và che mất cột chi phí — dễ bị bỏ sót).
function StepRow({ step }: { step: PostGradStep }) {
  return (
    <tr className="border-b border-rule align-top last:border-b-0">
      <td className="px-3 py-2.5">
        <div className="font-medium text-ink">
          {step.stepOrder}. {step.stepName}
        </div>
        {step.provider && (
          <div className="mt-0.5 text-xs text-ink-3">{step.provider}</div>
        )}
        <div className="mt-1.5 space-y-0.5 sm:hidden">
          <div className="tabular-nums text-ink">
            {durationText(step)} ·{" "}
            <b>
              <Cost step={step} />
            </b>
          </div>
          <div className="text-xs">
            Nguồn: <SourceLink step={step} />
          </div>
        </div>
        {step.note && (
          <p className="mt-1.5 text-xs leading-relaxed text-ink-2">
            {step.note}
          </p>
        )}
      </td>
      <td className="hidden whitespace-nowrap px-3 py-2.5 text-right tabular-nums text-ink sm:table-cell">
        {durationText(step)}
      </td>
      <td className="hidden whitespace-nowrap px-3 py-2.5 text-right tabular-nums text-ink sm:table-cell">
        <Cost step={step} />
      </td>
      <td className="hidden px-3 py-2.5 text-xs sm:table-cell">
        <SourceLink step={step} />
      </td>
    </tr>
  );
}

export default function PostGradCostBlock({
  postGrad,
}: {
  postGrad: PostGrad | null;
}) {
  if (!postGrad) return null;
  const { profession, steps } = postGrad;
  const totalTime = `${postGrad.hasUnknownDuration ? "≥" : "≈"} ${formatYearsFromMonths(postGrad.totalMonths)}`;
  const totalCost = formatMillionsRange(
    postGrad.totalCostMin,
    postGrad.totalCostMax,
  );

  return (
    <section id="chi-phi-hanh-nghe" className="scroll-mt-6 space-y-3">
      <h2 className="text-lg font-semibold text-ink">
        Chi phí sau tốt nghiệp để hành nghề {profession}
      </h2>

      {steps.length === 0 ? (
        <Callout tone="warn">
          Muốn hành nghề {profession}, bạn cần được cấp phép sau khi tốt nghiệp
          (thường gồm thời gian thực hành hoặc đào tạo nghề và một kỳ thi).
          hocphi.info đang tổng hợp chi phí của lộ trình này — tổng học phí ở
          trên <b>chưa bao gồm</b> khoản đó.
        </Callout>
      ) : (
        <>
          <Callout tone="warn">
            Bằng cử nhân chưa đủ để hành nghề {profession}. Các khoản dưới đây{" "}
            <b>không thuộc học phí nhà trường</b> và thường không có trong đề án
            tuyển sinh. Đây là lộ trình tối thiểu bắt buộc, tổng hợp từ quy định
            chung của nghề (áp dụng cho mọi trường), tính đến khi đủ điều kiện
            hành nghề. Nếu bạn làm công việc khác của ngành không cần cấp phép
            thì không phải trả các khoản này.
          </Callout>

          <div className="overflow-hidden rounded-xl border border-border bg-surface">
            <table className="w-full border-collapse text-sm">
              <caption className="sr-only">
                Các bước để hành nghề {profession} sau tốt nghiệp, thời gian và
                chi phí
              </caption>
              <thead>
                <tr className="border-b border-border bg-surface-2 text-left text-ink-3">
                  <th scope="col" className="px-3 py-2 font-medium">
                    Bước
                  </th>
                  <th
                    scope="col"
                    className="hidden px-3 py-2 text-right font-medium sm:table-cell"
                  >
                    Thời gian
                  </th>
                  <th
                    scope="col"
                    className="hidden px-3 py-2 text-right font-medium sm:table-cell"
                  >
                    Chi phí
                  </th>
                  <th
                    scope="col"
                    className="hidden px-3 py-2 font-medium sm:table-cell"
                  >
                    Nguồn
                  </th>
                </tr>
              </thead>
              <tbody>
                {steps.map((s) => (
                  <StepRow key={s.stepOrder} step={s} />
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-border bg-surface-2 font-semibold text-ink">
                  <th scope="row" className="px-3 py-2 text-left">
                    Tổng thêm
                    <span className="block font-normal tabular-nums sm:hidden">
                      {totalTime} · <b>{totalCost}</b>
                    </span>
                  </th>
                  <td className="hidden whitespace-nowrap px-3 py-2 text-right tabular-nums sm:table-cell">
                    {totalTime}
                  </td>
                  <td className="hidden whitespace-nowrap px-3 py-2 text-right tabular-nums sm:table-cell">
                    {totalCost}
                  </td>
                  <td className="hidden sm:table-cell" />
                </tr>
              </tfoot>
            </table>
          </div>

          <p className="text-xs leading-relaxed text-ink-3">
            Thời gian chưa tính thời gian chờ giữa các đợt tuyển sinh và đợt
            thi. Khoảng chi phí đi từ mức thấp nhất tới cao nhất đã ghi nhận
            (khác nhau theo lớp học và địa phương), không gồm sinh hoạt phí và
            các phí định kỳ sau khi đã hành nghề.
            {steps.some((s) => s.confidence === "estimated") &&
              " Mức phí ghi “ước lượng” là của bước chưa có biểu phí chính thức — cách ước lượng ghi ngay dưới bước đó."}
            {postGrad.checkedAt &&
              ` Nguồn kiểm tra lần cuối: ${formatDateVi(postGrad.checkedAt)}.`}{" "}
            <Link
              href="/phuong-phap#chi-phi-hanh-nghe"
              className="text-accent hover:underline"
            >
              Cách tính
            </Link>
          </p>
        </>
      )}
    </section>
  );
}
