export type CategoryLink = {
  slug: string;
  label: string;
  bgClass: string; // 背景色クラス（Tailwind）
  hoverClass: string; // hover時のクラス
};

export const CATEGORY_LINKS: CategoryLink[] = [
  { slug: "animal", label: "動物", bgClass: "bg-blue-600", hoverClass: "hover:bg-blue-700" },
  { slug: "fish", label: "魚", bgClass: "bg-cyan-600", hoverClass: "hover:bg-cyan-700" },
  { slug: "insect", label: "昆虫", bgClass: "bg-emerald-600", hoverClass: "hover:bg-emerald-700" },
  { slug: "bird", label: "鳥", bgClass: "bg-indigo-600", hoverClass: "hover:bg-indigo-700" },
  { slug: "food", label: "食べ物", bgClass: "bg-orange-600", hoverClass: "hover:bg-orange-700" },
  { slug: "sports", label: "スポーツ", bgClass: "bg-rose-600", hoverClass: "hover:bg-rose-700" },
];
