// Chọn tối đa `max` bài liên quan (plan D10): cùng nhóm trước, mới nhất trước,
// bù bằng bài mới nhất còn lại; không tự liên quan; có thể rỗng.
// `posts` đã sắp mới nhất → cũ nhất.

export function pickRelated(posts, slug, max = 3) {
  const self = posts.find((p) => p.slug === slug);
  if (!self) return [];
  const others = posts.filter((p) => p.slug !== slug);
  const samePillar = others.filter((p) => p.pillar === self.pillar);
  const rest = others.filter((p) => p.pillar !== self.pillar);
  return [...samePillar, ...rest].slice(0, max).map((p) => p.slug);
}
