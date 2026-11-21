<script setup lang="ts">
import { useRouter } from "vue-router";
import AppIcon from "@presentation/components/common/AppIcon.vue";

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
    iconName: "male",
    badge: "ویژه آقایان",
    badgeColor: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
    iconBg: "bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400",
  },
  {
    stageId: 3,
    title: "راهنمای ویژه خانم‌ها",
    subtitle: "هنر احترام، درک غار تنهایی، صراحت و همراهی",
    iconName: "female",
    badge: "ویژه خانم‌ها",
    badgeColor: "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300",
    iconBg: "bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400",
  },
  {
    stageId: 4,
    title: "ارتباط کم با جنس مخالف",
    subtitle: "برای افراد تک‌فرزند یا بدون خواهر و برادر",
    iconName: "handshake",
    badge: "راهنمای اختصاصی",
    badgeColor: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
    iconBg: "bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400",
  },
  {
    stageId: 5,
    title: "هنر گفت‌وگو و حل تعارض",
    subtitle: "چطور صحبت کنیم؟ پیام‌های «من» و مهار دعوا",
    iconName: "chat",
    badge: "مهارت کلامی",
    badgeColor: "bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300",
    iconBg: "bg-teal-500/10 text-teal-600 dark:bg-teal-500/20 dark:text-teal-400",
  },
  {
    stageId: 6,
    title: "بایدها و نبایدهای قطعی",
    subtitle: "کارهای پیونددهنده و خطوط قرمز سمی رابطه",
    iconName: "balance",
    badge: "بایدها و نبایدها",
    badgeColor: "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300",
    iconBg: "bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400",
  },
  {
    stageId: 7,
    title: "ابراز توجه و محبت روزمره",
    subtitle: "زبان‌های پنج‌گانه عشق، آغوش و حساب عاطفی",
    iconName: "heart",
    badge: "صمیمیت و محبت",
    badgeColor: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
    iconBg: "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400",
  },
] as const;
</script>

<template>
  <div class="overflow-hidden rounded-3xl bg-gradient-to-br from-rose-500/10 via-pink-500/5 to-amber-500/10 p-5 ring-1 ring-rose-500/20 dark:from-rose-950/30 dark:via-slate-900 dark:to-amber-950/20 dark:ring-rose-500/20 sm:p-6 shadow-sm">
    <!-- Header -->
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div class="flex items-center gap-3.5">
        <span class="flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl bg-rose-500/15 text-rose-600 dark:bg-rose-500/25 dark:text-rose-300 shadow-xs">
          <AppIcon name="couple_communication" size="xl" filled />
        </span>
        <div>
          <div class="flex items-center gap-2">
            <h2 class="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
              راهنمای جامع ارتباط و تعامل زوجین
            </h2>
            <span class="rounded-full bg-rose-100 px-2.5 py-0.5 text-[11px] font-bold text-rose-800 dark:bg-rose-950 dark:text-rose-300">
              جدید و علمی
            </span>
          </div>
          <p class="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-5">
            راهنمای تفکیک‌شده برای زن و مرد، مهارت‌های کلامی، زبان‌های عشق و حل چالش‌های ارتباطی
          </p>
        </div>
      </div>

      <button
        type="button"
        class="inline-flex items-center gap-1.5 self-start sm:self-center rounded-2xl bg-rose-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-rose-700 transition dark:bg-rose-500 dark:hover:bg-rose-600"
        @click="openSection()"
      >
        <span>مشاهده کل راهنما (۷ مرحله)</span>
        <span>←</span>
      </button>
    </div>

    <!-- Quick Access Cards Grid -->
    <div class="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <button
        v-for="item in quickSections"
        :key="item.stageId"
        type="button"
        class="group flex flex-col justify-between rounded-2xl bg-white/95 p-4 text-right shadow-xs ring-1 ring-slate-200/80 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:ring-rose-400 active:scale-[0.985] dark:bg-slate-900/90 dark:ring-slate-800 dark:hover:ring-rose-500"
        @click="openSection(item.stageId)"
      >
        <div class="flex flex-col gap-2">
          <div class="flex items-center justify-between">
            <span
              class="flex h-9 w-9 items-center justify-center rounded-xl transition-transform group-hover:scale-110 shadow-xs"
              :class="item.iconBg"
            >
              <AppIcon :name="item.iconName" size="sm" filled />
            </span>
            <span class="rounded-md px-2 py-0.5 text-[10px] font-bold" :class="item.badgeColor">
              {{ item.badge }}
            </span>
          </div>

          <h3 class="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-rose-600 dark:text-slate-100 dark:group-hover:text-rose-400 transition-colors">
            {{ item.title }}
          </h3>

          <p class="text-[11px] leading-5 text-slate-500 dark:text-slate-400 line-clamp-2">
            {{ item.subtitle }}
          </p>
        </div>

        <div class="mt-3 flex items-center justify-end text-[11px] font-bold text-rose-600 dark:text-rose-400 group-hover:underline transition-transform duration-200 group-hover:-translate-x-1">
          <span>مطالعه این بخش ←</span>
        </div>
      </button>
    </div>

    <!-- Sub-banner: Underlying biological & psychological differences link -->
    <div class="mt-4 flex items-center justify-between rounded-2xl bg-white/70 p-3 ring-1 ring-slate-200/70 dark:bg-slate-800/70 dark:ring-slate-700/60 text-xs">
      <div class="flex items-center gap-2.5">
        <span class="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-300">
          <AppIcon name="brain" size="xs" />
        </span>
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
