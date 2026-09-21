export const CATEGORIES = [
  { id: "product", label: "产品设计", en: "Product Design" },
  { id: "logo", label: "Logo", en: "Branding" },
  { id: "video", label: "视频", en: "Motion" },
  { id: "illustration", label: "插画", en: "Illustration" },
  { id: "painting", label: "绘画", en: "Painting" },
  { id: "ai", label: "AI", en: "AI" },
];

export function categoryLabel(id) {
  return CATEGORIES.find((item) => item.id === id)?.label || "产品设计";
}

export function normalizeCategory(id) {
  return CATEGORIES.some((item) => item.id === id) ? id : "product";
}
