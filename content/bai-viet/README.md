# Viết bài cho `/bai-viet`

Mỗi bài là **một thư mục** trong `content/bai-viet/`, tên thư mục chính là **slug** (URL
`/bai-viet/<slug>`). Thư mục chứa `index.md` và ảnh của bài.

```
content/bai-viet/
  hoc-cntt-dai-tra-chenh-bao-nhieu/
    index.md
    bieu-do-hoc-phi.webp
    cover.png            # tuỳ chọn: ảnh bìa tự làm 1200×630
  published.json         # TỰ GHI bởi `make blog` (đừng sửa tay); không lên git
  redirects.json         # khai báo khi đổi slug / gỡ bài; không lên git
  _template/             # mẫu cho `make blog-new` (thư mục bắt đầu bằng _ bị bỏ qua)
```

## Quy trình

| Việc | Lệnh |
|---|---|
| Tạo bài mới (đang là nháp) | `make blog-new SLUG=ten-bai-viet` |
| Xem trước khi viết (kể cả nháp, tự cập nhật khi lưu file) | `make blog-dev` rồi mở http://localhost:3000/bai-viet |
| Kiểm tra toàn bộ (không đăng) | `make blog-check` |
| Đăng: kiểm tra → deploy → ghi `published.json` | `make blog` |
| Chạy test của script | `npm run test:blog` |

Đăng bài: bỏ `draft: true` khỏi front matter → `make blog-check` → `make blog`.

> **Nội dung bài KHÔNG nằm trong git.** `.gitignore` bỏ qua mọi thứ trong `content/bai-viet/`
> trừ `README.md` và `_template/` để repo không phình vì ảnh. Hệ quả: git không phải bản sao lưu
> bài viết và CI không kiểm tra được nội dung. **Hãy tự sao lưu thư mục `content/bai-viet/`**
> (ví dụ một repo riêng tư, Time Machine hoặc iCloud) — nhất là `published.json` và
> `redirects.json`, vì mất hai file này thì `make blog-check` không còn chặn được việc làm chết URL.

Sửa bài đã đăng: sửa file rồi `make blog` lại. Bản mới thay hẳn bản cũ khi deploy. Muốn
mọi người biết có sửa, đặt `updated: YYYY-MM-DD`.

## Front matter

| Trường | Bắt buộc | Ghi chú |
|---|---|---|
| `title` | có | Nên ≤ 80 ký tự (dài hơn bị cảnh báo vì tràn thẻ chia sẻ; > 120 là lỗi) |
| `summary` | có | 2–3 câu **trả lời thẳng** câu hỏi của bài. Hiện đầu bài và làm mô tả khi chia sẻ |
| `date` | có | `YYYY-MM-DD` |
| `updated` | không | `YYYY-MM-DD`, không sớm hơn `date`; hiện "Cập nhật lần cuối" |
| `pillar` | có | `data` (dữ liệu & phân tích gốc), `research` (câu hỏi nghiên cứu), `news` (tin kèm góc học phí) |
| `scope` | **có nếu `pillar: data`** | Phạm vi số liệu: bao nhiêu trường/ngành, năm học nào, độ phủ chưa đầy đủ. Hiện thành ô "Phạm vi số liệu" |
| `sources` | có, ≥ 1 | Danh sách `{ name, url, accessed }`; `accessed` = ngày bạn đối chiếu nguồn |
| `author` | không | Mặc định: Nguyễn Văn Biển — Người sáng lập hocphi.info |
| `cover` | không | Ảnh bìa tự làm (nên 1200×630, ≤ 300 KB). Có thì dùng thay thẻ tự sinh khi chia sẻ |
| `draft` | không | `true` = nháp: không vào danh sách, sitemap, feed, bản production |
| `related` | không | Liên kết "Tra cứu học phí liên quan": `{ label, href }`, `href` là `/truong/<slug>`, `/nganh/<truong>/<nganh>` hoặc `/nganh` |

## Viết nội dung

- Mở đầu bằng con số/câu trả lời. Văn phong ngắn gọn cho học sinh, tránh thuật ngữ.
- Dùng `##` cho mục (tự thành mục lục). **Không dùng `#`** — tiêu đề trang đã là h1.
- Bảng dùng cú pháp Markdown (tự bọc cuộn ngang trên điện thoại).
- **Không gộp khác hệ đào tạo** (đại trà / chất lượng cao / tiên tiến / quốc tế) vào một con
  số; nêu rõ số trường công bố hay số ước lượng. Xem `/phuong-phap`.
- Không dùng HTML thô (bị chặn). Không sao chép nguyên văn bài của báo khác: viết phân tích
  riêng và ghi nguồn.

### Ảnh

- Đặt cạnh `index.md`, dẫn bằng đường dẫn tương đối, **luôn có mô tả thay thế**:
  `![Biểu đồ cột: học phí 4 trường](bieu-do.webp)`.
- Định dạng png / jpg / webp. **Mỗi ảnh ≤ 300 KB** (từ 150 KB trở lên bị cảnh báo).
- Biểu đồ nên xuất nền trong suốt hoặc trung tính để đọc được ở chế độ tối.
- Ảnh nằm trong thư mục mà không bài nào dùng sẽ bị bỏ qua (có cảnh báo).

## Đổi slug, xoá, gỡ bài

URL đã đăng và đã chia sẻ lên Facebook/Threads **không được chết**. `make blog-check` (và CI)
chặn nếu một bài đã đăng biến mất mà chưa khai báo trong `redirects.json`:

```json
{
  "redirects": [{ "from": "slug-cu", "to": "slug-moi" }],
  "gone": ["slug-da-go-han"]
}
```

- Đổi tên: đổi tên thư mục, thêm `redirects` (slug mới phải là bài đang đăng).
- Gỡ hẳn: thêm vào `gone` (URL trả 404).
- Chuyển một bài đã đăng thành nháp cũng cần khai báo như vậy.

## Đăng lên Facebook / Threads và đo kết quả

**Quy ước UTM** (bạn tự gắn vào link khi đăng; site không tự gắn, và canonical luôn sạch):

```
https://hocphi.info/bai-viet/<slug>?utm_source=facebook&utm_medium=social&utm_campaign=<slug>
https://hocphi.info/bai-viet/<slug>?utm_source=threads&utm_medium=social&utm_campaign=<slug>
```

- `utm_source`: `facebook` hoặc `threads` (hoặc nơi khác: `zalo`, `group-<tên>`…).
- `utm_medium`: luôn `social`. `utm_campaign`: slug của bài.
- Trình duyệt nhúng của Facebook/Threads hay xoá thông tin nguồn, nên **không có UTM thì lượt vào
  thường bị tính là "truy cập trực tiếp"**. Luôn gắn UTM.
- Nền tảng hạ reach bài có link: đăng nội dung đủ giá trị ngay trên bài đăng (ảnh biểu đồ chính,
  3 dòng ý chính) rồi đặt link ở bình luận đầu hoặc trong bio.

**Thẻ xem trước (ảnh + tiêu đề) bị giữ cũ sau khi sửa:** Facebook lưu bộ nhớ đệm theo URL.
Dán link vào [Sharing Debugger](https://developers.facebook.com/tools/debug/) và bấm "Scrape
Again". Threads chưa có công cụ chính thức; cách thực tế là dán lại link có thêm tham số vô hại
(ví dụ `&v=2`) — chưa được kiểm chứng.

**Đo lường (Umami Cloud, không cookie).**
1. Tạo website trên umami.is, lấy *Website ID*.
2. Thêm vào `.env.production` (file này không lên git): `NEXT_PUBLIC_UMAMI_ID=<website id>`.
   Không có biến này thì không nạp script nào. Có thể đổi địa chỉ script bằng `NEXT_PUBLIC_UMAMI_SRC`.
3. `make blog` (hoặc `make deploy`) để biến có hiệu lực — nó được "đóng cứng" lúc build.

Sự kiện đang được ghi nhận (thuộc tính `data-umami-event` trên thẻ):

| Sự kiện | Khi nào |
|---|---|
| `post-cta-lookup` | Bấm "Tra cứu…" trong bài (khối liên quan hoặc cột phải) |
| `share-facebook`, `share-threads`, `share-copy-link` | Bấm nút chia sẻ |
| `follow-facebook`, `follow-threads` | Bấm nút theo dõi ở trang danh sách |

Xem theo bài: lọc theo đường dẫn `/bai-viet/<slug>`. Xem theo nguồn: báo cáo UTM / Referrer.
Tỷ lệ chuyển sang tra cứu = số lần `post-cta-lookup` ÷ số lượt xem bài đó. Ngưỡng "đạt" do bạn
đặt sau khoảng 2 tuần số liệu đầu tiên.

## Danh sách kiểm tra sau mỗi lần đăng

- [ ] Mở URL trên điện thoại (tốt nhất là từ trong ứng dụng Facebook/Threads): đọc được, bảng cuộn
      ngang, ảnh hiện.
- [ ] Sharing Debugger của Facebook hiện đúng tiêu đề, mô tả, ảnh 1200×630.
- [ ] Dán link vào Threads: thẻ hiện đúng.
- [ ] `curl -I https://hocphi.info/bai-viet/khong-co` trả **404** (không phải 200).
- [ ] `https://hocphi.info/sitemap.xml` và `/bai-viet/feed.xml` có bài mới.
- [ ] Lượt xem thử có UTM hiện đúng nguồn trong Umami.
- [ ] Đã sao lưu thư mục `content/bai-viet/` (nó không nằm trong git).
- [ ] Nếu có lỗi nặng: quay lại bản trước (`wrangler rollback`, hoặc revert commit rồi `make deploy`).
