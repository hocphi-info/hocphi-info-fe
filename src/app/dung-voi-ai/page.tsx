import type { Metadata } from "next";
import Link from "next/link";

import Callout from "@/components/Callout";
import CopyableCode from "@/components/CopyableCode";
import { MCP_URL } from "@/lib/site";

// Server Component, static. Client setup steps were checked against each
// vendor's docs on 2026-09-30; those UIs change often, so keep the wording
// generic where the vendor's own docs are the better reference.

export const metadata: Metadata = {
  title: "Dùng dữ liệu học phí với AI (MCP)",
  description:
    "Kết nối Claude, ChatGPT, Cursor hoặc Claude Code với dữ liệu học phí của hocphi.info qua máy chủ MCP công khai, miễn phí, chỉ đọc, không cần đăng nhập.",
  alternates: { canonical: "/dung-voi-ai" },
  robots: { index: true, follow: true },
};

// Every question below has real data behind it at the time of writing (pilot
// set: 13 TP.HCM schools). Numbers are deliberately not quoted here — they
// change with each data update; the assistant reads them live.
const SAMPLE_QUESTIONS = [
  "So sánh học phí ngành Khoa học máy tính hệ đại trà ở HCMUT, HUTECH và Đại học Quốc tế.",
  "Ngành Công nghệ thông tin ở những trường nào có dữ liệu? Trường nào rẻ nhất, đắt nhất?",
  "Học phí ngành Y khoa ở HUTECH và Đại học Y Dược TP.HCM chênh nhau bao nhiêu?",
  "Ước tính tổng chi phí cả khoá học ngành Khoa học máy tính ở Bách Khoa TP.HCM.",
  "Ngành Tài chính – Ngân hàng học ở đâu, hệ nào, mỗi năm bao nhiêu?",
  "Những ngành nào gần với Khoa học máy tính mà học phí thấp hơn?",
];

const CLIENTS = [
  {
    name: "Claude Code",
    steps: (
      <>
        <p>Chạy lệnh sau trong terminal, rồi mở phiên mới:</p>
        <CopyableCode
          label="Lệnh thêm MCP vào Claude Code"
          text={`claude mcp add --transport http hocphi ${MCP_URL}`}
        />
        <p>
          Gõ <code className="font-mono">/mcp</code> để kiểm tra trạng thái kết
          nối.
        </p>
      </>
    ),
  },
  {
    name: "Claude (web / máy tính)",
    steps: (
      <ol className="list-decimal space-y-1 pl-5">
        <li>
          Vào <strong>Customize → Connectors</strong>.
        </li>
        <li>
          Bấm <strong>+</strong> rồi <strong>Add custom connector</strong>.
        </li>
        <li>Dán địa chỉ máy chủ ở trên, bỏ qua phần xác thực, bấm Add.</li>
        <li>
          Trong cuộc trò chuyện, bấm <strong>+</strong> → Connectors để bật.
        </li>
        <li className="text-ink-3">
          Gói miễn phí được thêm 1 connector tuỳ chỉnh; gói Team/Enterprise do
          chủ tổ chức thêm ở Organization settings.
        </li>
      </ol>
    ),
  },
  {
    name: "ChatGPT",
    steps: (
      <ol className="list-decimal space-y-1 pl-5">
        <li>
          Cần gói Plus, Pro, Business, Enterprise hoặc Education, dùng trên web.
        </li>
        <li>
          Bật <strong>Settings → Security and login → Developer mode</strong>.
        </li>
        <li>
          Ở trang Plugins, bấm nút <strong>+</strong> để tạo app chế độ nhà phát
          triển cho máy chủ MCP từ xa, dán địa chỉ ở trên (không xác thực).
        </li>
        <li>
          Trong cuộc trò chuyện, chọn Developer mode ở menu <strong>+</strong>{" "}
          để dùng app.
        </li>
      </ol>
    ),
  },
  {
    name: "Cursor",
    steps: (
      <>
        <p>
          Thêm vào <code className="font-mono">~/.cursor/mcp.json</code> (toàn
          cục) hoặc <code className="font-mono">.cursor/mcp.json</code> (theo dự
          án):
        </p>
        <CopyableCode
          label="Cấu hình mcp.json cho Cursor"
          text={JSON.stringify(
            { mcpServers: { hocphi: { url: MCP_URL } } },
            null,
            2,
          )}
        />
      </>
    ),
  },
];

export default function UseWithAiPage() {
  return (
    <main className="mx-auto w-full min-w-0 max-w-3xl flex-1 px-4 py-8">
      <section className="py-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-accent-strong">
          Dành cho người dùng AI
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
          Hỏi trợ lý AI về học phí, bằng dữ liệu của hocphi.info
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-ink-2 sm:text-base">
          hocphi.info có một máy chủ <strong>MCP</strong> công khai: chuẩn để
          trợ lý AI (Claude, ChatGPT, Cursor…) tra cứu dữ liệu có nguồn thay vì
          đoán. Miễn phí, chỉ đọc, không cần đăng nhập. Số liệu là đúng những
          con số bạn thấy trên website, kèm năm học và nguồn.
        </p>
      </section>

      <section className="py-4">
        <h2 className="text-xl font-bold tracking-tight text-ink">
          Địa chỉ máy chủ
        </h2>
        <div className="mt-3">
          <CopyableCode label="Địa chỉ máy chủ MCP" text={MCP_URL} />
        </div>
      </section>

      <section className="py-6">
        <h2 className="text-xl font-bold tracking-tight text-ink">
          Cách kết nối
        </h2>
        <div className="mt-4 space-y-4">
          {CLIENTS.map((c) => (
            <div
              key={c.name}
              className="space-y-2 rounded-xl border border-border p-4 text-sm leading-relaxed text-ink-2"
            >
              <h3 className="text-base font-semibold text-ink">{c.name}</h3>
              {c.steps}
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-ink-3">
          Giao diện của từng ứng dụng thay đổi thường xuyên; nếu tên nút khác,
          hãy xem hướng dẫn thêm máy chủ MCP từ xa của chính ứng dụng đó.
        </p>
      </section>

      <section className="py-4">
        <h2 className="text-xl font-bold tracking-tight text-ink">
          Câu hỏi thử
        </h2>
        <ul className="mt-3 space-y-2 text-sm leading-relaxed text-ink-2">
          {SAMPLE_QUESTIONS.map((q) => (
            <li
              key={q}
              className="rounded-lg border border-border bg-surface-2 px-4 py-2.5"
            >
              {q}
            </li>
          ))}
        </ul>
        <p className="mt-3 text-sm text-ink-2">
          Hỏi về trường/ngành chưa có dữ liệu, trợ lý sẽ nói là chưa có thay vì
          tự đưa ra con số. Xem phạm vi dữ liệu ở trang{" "}
          <Link href="/du-lieu" className="text-accent-strong underline">
            Dữ liệu &amp; nguồn
          </Link>
          .
        </p>
      </section>

      <section className="space-y-3 py-6">
        <Callout tone="warn" title="Lưu ý">
          Số liệu là <strong>dữ liệu tham khảo</strong>, không thay thế thông
          báo chính thức của nhà trường. Hãy đối chiếu nguồn trước khi ra quyết
          định. Hiện dữ liệu mới ở giai đoạn thử nghiệm với một số trường tại
          TP.HCM và Hà Nội.
        </Callout>
        <Callout title="Giới hạn sử dụng">
          Đây là dự án học tập chạy trên hạ tầng miễn phí: giới hạn khoảng 60
          yêu cầu mỗi phút cho mỗi địa chỉ IP. Lần gọi đầu sau một lúc không ai
          dùng có thể chậm vài giây do máy chủ được khởi động lại.
        </Callout>
      </section>
    </main>
  );
}
