import type { HamyarGuideMeta, HamyarCategory } from "@domain/hamyar/HamyarGuide";

export interface HamyarCategoryFilter {
  readonly key: "all" | HamyarCategory;
  readonly label: string;
}

export const HAMYAR_CATEGORIES: readonly HamyarCategoryFilter[] = [
  { key: "all", label: "همه راهنماها" },
  { key: "marriage", label: "پیش از ازدواج و ازدواج" },
  { key: "pregnancy", label: "بارداری و نوزاد" },
  { key: "parenting", label: "والدگری و رشد فرزند" },
  { key: "emptynest", label: "میانسالی و لانه خالی" },
];

export const HAMYAR_CATALOG: readonly HamyarGuideMeta[] = [
  {
    id: "premarital_acquaintance",
    title: "راهنمای آموزشی مراحل آشنایی پیش از ازدواج",
    shortTitle: "آشنایی پیش از ازدواج",
    tag: "پیش از ازدواج",
    category: "marriage",
    categoryLabel: "پیش از ازدواج و ازدواج",
    icon: "💍",
    jsonFile: "mahak_premarital_acquaintance_guide.json",
    summary: "شناخت خود، معیارهای انتخاب همسر، چارچوب و مراحل آشنایی، نحوه تعامل و خط قرمزهای مهم پیش از تصمیم نهایی.",
    colorClass: {
      bg: "bg-amber-500/10 dark:bg-amber-500/20",
      text: "text-amber-700 dark:text-amber-300",
      border: "hover:ring-amber-400/60 dark:hover:ring-amber-500/50",
      badge: "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-200",
      glow: "group-hover:text-amber-600 dark:group-hover:text-amber-400",
    },
  },
  {
    id: "early_marriage",
    title: "راهنمای آموزشی مراحل اول ازدواج",
    shortTitle: "مراحل اول ازدواج",
    tag: "اوایل زندگی مشترک",
    category: "marriage",
    categoryLabel: "پیش از ازدواج و ازدواج",
    icon: "🏡",
    jsonFile: "mahak_early_marriage_guide.json",
    summary: "گذار به زندگی مشترک، الگوی طبیعی رضایت زناشویی، مهارت‌های گفت‌وگو، مدیریت مالی مشترک، تقسیم کار و مرزبندی با خانواده‌ها.",
    colorClass: {
      bg: "bg-emerald-500/10 dark:bg-emerald-500/20",
      text: "text-emerald-700 dark:text-emerald-300",
      border: "hover:ring-emerald-400/60 dark:hover:ring-emerald-500/50",
      badge: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200",
      glow: "group-hover:text-emerald-600 dark:group-hover:text-emerald-400",
    },
  },
  {
    id: "motherhood",
    title: "راهنمای آموزشی مادر شدن: از تصمیم تا ماه‌های اول مادری",
    shortTitle: "مادر شدن",
    tag: "مادران و بارداری",
    category: "pregnancy",
    categoryLabel: "بارداری و نوزاد",
    icon: "🌸",
    jsonFile: "mahak_motherhood_guide.json",
    summary: "آمادگی جسمی و روانی زن، فازهای سه‌گانه بارداری، زایمان، ریکاوری، سلامت روان پس از زایمان، شیردهی و مراقبت نوزاد.",
    colorClass: {
      bg: "bg-rose-500/10 dark:bg-rose-500/20",
      text: "text-rose-700 dark:text-rose-300",
      border: "hover:ring-rose-400/60 dark:hover:ring-rose-500/50",
      badge: "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-200",
      glow: "group-hover:text-rose-600 dark:group-hover:text-rose-400",
    },
  },
  {
    id: "parenting",
    title: "راهنمای آموزشی پدر شدن: از تصمیم تا بزرگسالی فرزند",
    shortTitle: "پدر شدن و والدگری",
    tag: "پدران و رشد فرزند",
    category: "parenting",
    categoryLabel: "والدگری و رشد فرزند",
    icon: "🌱",
    jsonFile: "mahak_parenting_guide.json",
    summary: "نقش حیاتی پدر از دوران بارداری و زایمان همسر تا نوزادی، کودکی، نوجوانی و همراهی در مسیر استقلال فرزند.",
    colorClass: {
      bg: "bg-teal-500/10 dark:bg-teal-500/20",
      text: "text-teal-700 dark:text-teal-300",
      border: "hover:ring-teal-400/60 dark:hover:ring-teal-500/50",
      badge: "bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-200",
      glow: "group-hover:text-teal-600 dark:group-hover:text-teal-400",
    },
  },
  {
    id: "second_child",
    title: "راهنمای آموزشی آوردن فرزند دوم",
    shortTitle: "آوردن فرزند دوم",
    tag: "توسعه خانواده",
    category: "pregnancy",
    categoryLabel: "بارداری و نوزاد",
    icon: "👶",
    jsonFile: "mahak_second_child_guide.json",
    summary: "بررسی آمادگی زوجین، فاصله‌گذاری علمی بین دو کودک، آماده‌سازی روانی فرزند اول، پیشگیری از حسادت و تقسیم کار خانوادگی.",
    colorClass: {
      bg: "bg-sky-500/10 dark:bg-sky-500/20",
      text: "text-sky-700 dark:text-sky-300",
      border: "hover:ring-sky-400/60 dark:hover:ring-sky-500/50",
      badge: "bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-200",
      glow: "group-hover:text-sky-600 dark:group-hover:text-sky-400",
    },
  },
  {
    id: "mother_child_leaves",
    title: "راهنمای آموزشی مادر پس از ازدواج و رفتن فرزند (لانه خالی)",
    shortTitle: "مادر در دوران لانه خالی",
    tag: "مادران میانسال",
    category: "emptynest",
    categoryLabel: "میانسالی و لانه خالی",
    icon: "🕊️",
    jsonFile: "mahak_mother_empty_nest_guide.json",
    summary: "پذیرش احساسات طبیعی گذار لانه خالی، بازیابی هویت و اهداف فردی، رابطه با فرزند مستقل و همسرش، تغییرات یائسگی و مادربزرگی.",
    colorClass: {
      bg: "bg-purple-500/10 dark:bg-purple-500/20",
      text: "text-purple-700 dark:text-purple-300",
      border: "hover:ring-purple-400/60 dark:hover:ring-purple-500/50",
      badge: "bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-200",
      glow: "group-hover:text-purple-600 dark:group-hover:text-purple-400",
    },
  },
  {
    id: "father_child_leaves",
    title: "راهنمای آموزشی پدر پس از ازدواج و رفتن فرزند (لانه خالی)",
    shortTitle: "پدر در دوران لانه خالی",
    tag: "پدران میانسال",
    category: "emptynest",
    categoryLabel: "میانسالی و لانه خالی",
    icon: "🍃",
    jsonFile: "mahak_father_empty_nest_guide.json",
    summary: "تجربه پدرانه پس از استقلال فرزندان، چالش‌های بازنشستگی و هویت شغلی، سلامت جسم و روان میانسالی، رابطه عاطفی زوجین و پدربزرگی.",
    colorClass: {
      bg: "bg-indigo-500/10 dark:bg-indigo-500/20",
      text: "text-indigo-700 dark:text-indigo-300",
      border: "hover:ring-indigo-400/60 dark:hover:ring-indigo-500/50",
      badge: "bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-200",
      glow: "group-hover:text-indigo-600 dark:group-hover:text-indigo-400",
    },
  },
];

export function findHamyarGuideMeta(id: string): HamyarGuideMeta | undefined {
  return HAMYAR_CATALOG.find((g) => g.id === id);
}
