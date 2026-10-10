// Dữ liệu giả cho test (không phải test, nên không đặt tên *.test.mjs).
import crypto from "node:crypto";
import zlib from "node:zlib";

/** PNG hợp lệ ~`targetBytes` byte (nhiễu ngẫu nhiên nên nén kém). */
export function makePng(targetBytes = 600) {
  const side = Math.max(4, Math.ceil(Math.sqrt(targetBytes / 3)));
  const width = side;
  const height = side;
  const raw = Buffer.alloc((width * 3 + 1) * height);
  for (let y = 0; y < height; y++) {
    const off = y * (width * 3 + 1);
    raw[off] = 0; // filter: none
    crypto.randomFillSync(raw, off + 1, width * 3);
  }
  const chunk = (type, data) => {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length);
    const body = Buffer.concat([Buffer.from(type), data]);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(zlib.crc32(body));
    return Buffer.concat([len, body, crc]);
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // RGB
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", zlib.deflateSync(raw)),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

export function validFrontmatter(overrides = {}) {
  return {
    title: "Học CNTT đại trà: 4 trường, chênh nhau bao nhiêu tiền?",
    summary:
      "Năm đầu dao động 27,0 – 35,7 triệu đồng/năm; chênh 8,7 triệu mỗi năm giữa trường rẻ nhất và đắt nhất.",
    date: "2026-10-10",
    pillar: "data",
    scope: "4 trường công lập trong 50 trường pilot, năm học 2026–27.",
    sources: [
      {
        name: "Đề án tuyển sinh 2026 — ĐH Bách khoa Hà Nội",
        url: "https://example.edu.vn/de-an.pdf",
        accessed: "2026-09-15",
      },
    ],
    ...overrides,
  };
}

export function postFile(frontmatter, body = "## Mục một\n\nNội dung.\n") {
  const yaml = Object.entries(frontmatter)
    .map(([k, v]) => `${k}: ${JSON.stringify(v)}`)
    .join("\n");
  return `---\n${yaml}\n---\n\n${body}`;
}
