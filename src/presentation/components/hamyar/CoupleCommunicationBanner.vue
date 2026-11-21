<script setup lang="ts">
import { useRouter } from "vue-router";

const router = useRouter();

function openSection(stageId?: number): void {
  void router.push({
    name: "hamyar-guide",
    params: { guideId: "couple_communication" },
    query: stageId ? { stage: String(stageId) } : undefined,
  });
}

const quickSections = [
  {
    stageId: 2,
    title: "راهنمای ویژه آقایان",
    subtitle: "هنر شناخت زن، گوش دادن، نوازش و ابراز توجه",
    icon: "👨",
    badge: "ویژه آقایان",
    color: "from-blue-500/10 to-indigo-500/10 border-blue-200 dark:border-blue-900/60 dark:from-blue-950/30 dark:to-indigo-950/20",
    badgeColor: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
  },
  {
    stageId: 3,
    title: "راهنمای ویژه خانم‌ها",
    subtitle: "هنر احترام، درک غار تنهایی، صراحت و همراهی",
    icon: "👩",
    badge: "ویژه خانم‌ها",
    color: "from-rose-500/10 to-pink-500/10 border-rose-200 dark:border-rose-900/60 dark:from-rose-950/30 dark:to-pink-950/20",
    badgeColor: "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300",
  },
  {
    stageId: 4,
    title: "ارتباط کم با جنس مخالف",
    subtitle: "برای افراد تک‌فرزند یا بدون خواهر و برادر",
    icon: "🤝",
    badge: "راهنمای اختصاصی",
    color: "from-amber-500/10 to-orange-500/10 border-amber-200 dark:border-amber-900/60 dark:from-amber-950/30 dark:to-orange-950/20",
    badgeColor: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  },
  {
    stageId: 5,
    title: "هنر گفت‌وگو و حل تعارض",
    subtitle: "چطور صحبت کنیم؟ پیام‌های «من» و مهار دعوا",
    icon: "💬",
    badge: "مهارت کلامی",
    color: "from-teal-500/10 to-emerald-500/10 border-teal-200 dark:border-teal-900/60 dark:from-teal-950/30 dark:to-emerald-950/20",
    badgeColor: "bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300",
  },
  {
    stageId: 6,
    title: "بایدها و نبایدهای قطعی",
    subtitle: "کارهای پیونددهنده و خطوط قرمز سمی رابطه",
    icon: "⚖️",
    badge: "بایدها و نبایدها",
    color: "from-purple-500/10 to-violet-500/10 border-purple-200 dark:border-purple-900/60 dark:from-purple-950/30 dark:to-violet-950/20",
    badgeColor: "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300",
  },
  {
    stageId: 7,
    title: "ابراز توجه و محبت روزمره",
    subtitle: "زبان‌های پنج‌گانه عشق، آغوش و حساب عاطفی",
    icon: "💖",
    badge: "صمیمیت و محبت",
    color: "from-emerald-500/10 to-cyan-500/10 border-emerald-200 dark:border-emerald-900/60 dark:from-emerald-950/30 dark:to-cyan-950/20",
    badgeColor: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  },
] as const;
</script>

<template>
  <div class="overflow-hidden rounded-3xl bg-gradient-to-br from-rose-500/10 via-pink-500/5 to-amber-500/10 p-5 ring-1 ring-rose-500/20 dark:from-rose-950/30 dark:via-slate-900 dark:to-amber-950/20 dark:ring-rose-500/20 sm:p-6 shadow-sm">
    <!-- Header -->
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div class="flex items-center gap-3">
        <span class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-500/20 text-2xl text-rose-600 dark:bg-rose-500/30 dark:text-rose-300">
          💑
        </span>
        <div>
          <div class="flex items-center gap-2">
            <h2 class="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
              راهنمای جامع ارتباط و تعامل زوجین
            </h2>
            <span class="rounded-full bg-rose-100 px-2.5 py-0.5 text-[11px] font-bold text-rose-800 dark:bg-rose-950 dark:text-rose-300">
              جدید و کاربردی
            </span>
          </div>
          <p class="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-5">
            راهنمای علمی و تفکیک‌شده برای زن و مرد، مهارت‌های گفت‌وگو، زبان‌های عشق و رفع چالش‌های ارتباطی
          </p>
        </div>
      </div>

      <button
        type="button"
        class="inline-flex items-center gap-1.5 self-start sm:self-center rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-rose-700 transition dark:bg-rose-500 dark:hover:bg-rose-600"
        @click="openSection()"
      >
        <span>مشاهده کل راهنما (۷ مرحله)</span>
        <span>←</span>
      </button>
    </div>

    <!-- Quick Access Cards Grid -->
    <div class="mt-5 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
      <button
        v-for="item in quickSections"
        :key="item.stageId"
        type="button"
        class="group flex flex-col justify-between rounded-2xl bg-white/90 p-3.5 text-right shadow-sm ring-1 transition hover:shadow-md hover:ring-rose-400 active:scale-[0.99] dark:bg-slate-900/90 dark:ring-slate-800 dark:hover:ring-rose-500"
        @click="openSection(item.stageId)"
      >
        <div class="flex flex-col gap-1.5">
          <div class="flex items-center justify-between">
            <span class="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-lg dark:bg-slate-800">
              {{ item.icon }}
            </span>
            <span class="rounded-md px-2 py-0.5 text-[10px] font-bold" :class="item.badgeColor">
              {{ item.badge }}
            </span>
          </div>

          <h3 class="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-rose-600 dark:text-slate-100 dark:group-hover:text-rose-400 transition">
            {{ item.title }}
          </h3>

          <p class="text-[11px] leading-5 text-slate-500 dark:text-slate-400 line-clamp-2">
            {{ item.subtitle }}
          </p>
        </div>

        <div class="mt-2.5 flex items-center justify-end text-[11px] font-bold text-rose-600 dark:text-rose-400 group-hover:underline">
          <span>مطالعه این بخش ←</span>
        </div>
      </button>
    </div>

    <!-- Sub-banner: Underlying biological & psychological differences link -->
    <div class="mt-4 flex items-center justify-between rounded-2xl bg-white/60 p-3 ring-1 ring-slate-200/60 dark:bg-slate-800/60 dark:ring-slate-700/60 text-xs">
      <div class="flex items-center gap-2">
        <span class="text-base">🧠</span>
        <span class="text-slate-700 dark:text-slate-300 font-medium">
          مرحله ۱: تفاوت‌های بنیادین روان‌شناختی، زیستی و پردازش استرس در زن و مرد
        </span>
      </div>
      <button
        type="button"
        class="font-bold text-rose-600 hover:underline dark:text-rose-400 shrink-0 ms-2"
        @click="openSection(1)"
      >
        بررسی تفاوت‌ها ←
      </button>
    </div>
  </div>
</template>
