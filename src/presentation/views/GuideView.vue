<script setup lang="ts">
import { ref } from "vue";
import GuideSection from "@presentation/components/guide/GuideSection.vue";

const activeCategory = ref<string>("all");
const searchQuery = ref<string>("");

const categories = [
  { id: "all", label: "همه موضوعات", icon: "📑" },
  { id: "start", label: "شروع و خانه", icon: "🏠" },
  { id: "tracker", label: "همراه (ردیاب)", icon: "🩸" },
  { id: "hamyar", label: "همیار", icon: "🌱" },
  { id: "hamdel", label: "همدل", icon: "💞" },
  { id: "games", label: "هم‌راز", icon: "🎲" },
  { id: "security", label: "قفل، داده و یادآور", icon: "🛡️" },
  { id: "settings", label: "تنظیمات", icon: "⚙️" },
  { id: "health", label: "دانشنامه سلامت", icon: "🩺" },
];

const normalRanges = [
  { label: "طول کل چرخه", value: "۲۱ تا ۳۸ روز (میانگین رایج ۲۸ روز)" },
  { label: "طول خونریزی پریود", value: "معمولاً ۲ تا ۷ روز" },
  { label: "نوسان طول چرخه بین ماه‌ها", value: "تا ۷ تا ۹ روز اختلاف طبیعی است" },
  { label: "فاصله بین دو پریود", value: "کمتر از ۲۱ روز یا بیشتر از ۳۵ روز غیرعادی تلقی می‌شود" },
];

const dangerSigns = [
  "خیس شدن کامل یک نوار بهداشتی یا تامپون در کمتر از یک ساعت، برای چند ساعت متوالی.",
  "دفع لخته‌های خون بزرگ‌تر از یک انگور.",
  "خونریزی‌ای که بیش از ۷ روز طول بکشد.",
  "پریودهایی که فاصله‌شان کمتر از ۲۱ روز یا بیشتر از ۳۵ روز باشد، یا کاملاً نامنظم و غیرقابل‌پیش‌بینی باشند.",
  "قطع کامل پریود برای ۳ ماه یا بیشتر (بدون بارداری).",
  "خونریزی یا لکه‌بینی بین دو پریود یا بعد از رابطه جنسی.",
  "درد شدیدی که با مسکن‌های معمولی کنترل نشود، یا همراه با تب باشد.",
  "علائم کم‌خونی: خستگی مفرط، ضعف، سرگیجه یا تنگی نفس.",
];

const emergencySigns = [
  "غش کردن، سرگیجه شدید هنگام ایستادن، یا پوست سرد و مرطوب.",
  "ضربان قلب سریع و ضعیف یا تنگی نفس همراه با خونریزی شدید.",
  "خونریزی شدید همراه با درد قفسه سینه یا سبکی سر.",
];

function isVisible(sectionCategory: string, textContent: string): boolean {
  if (activeCategory.value !== "all" && activeCategory.value !== sectionCategory) {
    return false;
  }
  if (!searchQuery.value.trim()) return true;
  return textContent.toLowerCase().includes(searchQuery.value.trim().toLowerCase());
}
</script>

<template>
  <div class="mx-auto flex w-full max-w-4xl flex-col gap-6">
    <!-- Header -->
    <div class="flex flex-col gap-2">
      <div class="flex items-center gap-3">
        <span class="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-500/10 text-2xl text-teal-600 dark:bg-teal-500/20 dark:text-teal-300">
          📖
        </span>
        <div>
          <h1 class="text-xl font-bold text-slate-900 dark:text-slate-100">
            راهنمای جامع اپلیکیشن ماهک
          </h1>
          <p class="text-xs text-slate-500 dark:text-slate-400">
            آموزش کار با خانه، همراه، همیار، همدل، هم‌راز، قفل و پشتیبان‌گیری، به‌علاوه‌ی دانشنامه‌ی سلامت قاعدگی و نکات همراهی شریک
          </p>
        </div>
      </div>
    </div>

    <!-- Search & Category Filters -->
    <div class="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
      <!-- Search Input -->
      <div class="relative w-full">
        <input
          v-model="searchQuery"
          type="search"
          placeholder="جستجو در بخش‌های مختلف راهنما…"
          class="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pe-9 ps-10 text-xs sm:text-sm text-slate-900 placeholder-slate-400 transition focus:border-teal-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:border-teal-400"
        />
        <svg
          class="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path fill-rule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clip-rule="evenodd" />
        </svg>
        <button
          v-if="searchQuery"
          type="button"
          class="absolute end-2.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
          @click="searchQuery = ''"
        >
          <svg class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
          </svg>
        </button>
      </div>

      <!-- Categories Filter Chips -->
      <div class="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <button
          v-for="cat in categories"
          :key="cat.id"
          type="button"
          class="shrink-0 inline-flex items-center gap-1 rounded-xl px-3 py-1.5 font-medium transition"
          :class="activeCategory === cat.id
            ? 'bg-teal-600 text-white shadow-sm dark:bg-teal-500'
            : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'"
          @click="activeCategory = cat.id"
        >
          <span>{{ cat.icon }}</span>
          <span>{{ cat.label }}</span>
        </button>
      </div>
    </div>

    <!-- SECTION 1: Start & navigation -->
    <GuideSection
      v-show="isVisible('start', 'شروع ناوبری منو خانه نقش خود شریک نصب pwa آفلاین به‌روزرسانی راهنما تنظیمات')"
      title="۱. شروع سریع و ناوبری"
      icon="🧭"
    >
      <p>
        ماهک یک برنامه‌ی <strong>آفلاین و محلی (Local-first)</strong> است: داده‌ها در مرورگر همین دستگاه ذخیره می‌شوند و به‌جز دو قابلیت اختیاری (پشتیبان Google Drive و یادآور تلگرام) به هیچ سروری فرستاده نمی‌شوند. می‌توانید آن را مثل یک اپ روی صفحه‌ی اصلی گوشی نصب کنید و بدون اینترنت هم استفاده کنید؛ وقتی نسخه‌ی جدید منتشر شود، پیام به‌روزرسانی نشان داده می‌شود.
      </p>
      <p class="pt-1"><strong>انتخاب نقش در ورود:</strong></p>
      <ul class="list-inside list-disc space-y-1 text-xs sm:text-sm">
        <li><strong>«ردیابی برای خود»:</strong> ثبت پریود، ویرایش تاریخ‌ها و ثبت علائم روزانه. اسم نمایشی خود را از تنظیمات می‌گذارید و در سلام صفحه‌ی خانه می‌آید.</li>
        <li><strong>«ردیابی شریک»:</strong> می‌توانید یک یا چند نفر (همسر، خواهر، مادر...) را اضافه کنید و بین‌شان جابه‌جا شوید. داده‌ی هر نفر جداست، تب «علائم» پنهان است و راهنمای امروز با لحن حمایت‌گر نوشته می‌شود. در صفحه‌ی خانه نام فرد انتخاب‌شده در چیپ «در حال مراقبت از…» نمایش داده می‌شود.</li>
      </ul>
      <p class="pt-2"><strong>منوی اصلی:</strong> در موبایل پنج دکمه‌ی پایین صفحه است و دکمه‌ی گرد وسط، «خانه» است. از راست به چپ: <strong>همراه، هم‌راز، خانه، همدل، همیار</strong>. در دسکتاپ همین بخش‌ها در سایدبار هستند و «خانه» اول است. دو دکمه‌ی «راهنما» و «تنظیمات» بالای صفحه (موبایل) یا پایین سایدبار (دسکتاپ) قرار دارند.</p>
      <p class="text-xs text-slate-500">💡 اگر روی دکمه‌ی بخشی که الان در آن هستید بزنید، صفحه نرم به بالا اسکرول می‌شود.</p>
    </GuideSection>

    <!-- SECTION 2: Home -->
    <GuideSection
      v-show="isVisible('start', 'خانه صفحه اول وضعیت امروز یادآور دسترسی سریع کارت چالش همدل هم‌راز همیار پیشنهاد روز')"
      title="۲. خانه: خلاصه‌ی همه‌چیز در یک نگاه"
      icon="🏠"
    >
      <p>صفحه‌ی اول برنامه از بخش‌های مختلف خلاصه و پیشنهاد روز می‌سازد و هر کارت دکمه‌ی رفتن به بخش خودش را دارد. پیشنهادها هر روز عوض می‌شوند و در طول یک روز ثابت می‌مانند.</p>
      <ul class="list-inside list-disc space-y-1 text-xs sm:text-sm">
        <li><strong>کارت وضعیت (بالا):</strong> می‌گوید امروز روز چندم پریود است، چند روز تا پریود بعدی مانده، آیا در بازه‌ی باروری هستید یا پریود دیر شده؛ همراه با نوار پیشرفت چرخه و «راهنمای امروز». رنگ کارت با وضعیت چرخه عوض می‌شود. دکمه‌ی «رفتن به همراه» و (در حالت خود) «ثبت علائم امروز» همین‌جاست.</li>
        <li><strong>امروز یادتان نرود:</strong> پریود رسیده یا دیرشده، علائم ثبت‌نشده، چالش انجام‌نشده، تماس‌های امروز، مناسبت‌های نزدیک (تا ۳ روز) و قول‌های باز را یک‌جا جمع می‌کند.</li>
        <li><strong>دسترسی سریع:</strong> میان‌بر به ثبت علائم، تقویم، ثبت اشاره، تاریخ‌های مهم، چالش امروز، بازی دونفره و راهنمای زوجین.</li>
        <li><strong>همراه:</strong> تاریخ پریود بعدی، تخمک‌گذاری برآوردی، بازه‌ی باروری، میانگین چرخه و مدت پریود، به‌علاوه‌ی فهرست «امروز چه کاری بکنم / چطور کمک کنم».</li>
        <li><strong>چالش امروز:</strong> عنوان چالش، دکمه‌ی «انجامش دادیم» و وضعیت هفت روز هفته.</li>
        <li><strong>همدل:</strong> آمار دفترچه، سه مناسبت بعدی با شمارش معکوس و «امروز با این کار خوشحالش کن» (اشاره‌ها، ایده‌های هدیه، غذای مورد علاقه، پیام محبت‌آمیز، قول‌های باز و...).</li>
        <li><strong>هم‌راز:</strong> یک بازی، یک سؤال گفت‌وگو، یک ایده‌ی کوچک دونفره و سلیقه‌ی پوشش یا غذای مورد علاقه، به‌علاوه‌ی میان‌بر بازی‌ها.</li>
        <li><strong>همیار:</strong> درصد پیشرفت چک‌لیست راهنماها، پیشنهاد خواندن و یک نکته‌ی تصادفی روزانه؛ برای «ارتباط زوجین» هم کارت جدا دارد.</li>
      </ul>
      <p class="text-xs text-slate-500">🔒 بازی «پوزیشن‌ها» و کارت‌های دسته‌ی صمیمیت در صفحه‌ی اول نمایش داده نمی‌شوند.</p>
    </GuideSection>

    <!-- SECTION 3: Companion -->
    <GuideSection
      v-show="isVisible('tracker', 'همراه داشبورد تقویم ثبت پریود الگوریتم پیش بینی علائم تب راهنمای امروز ویرایش تاریخ')"
      title="۳. همراه: وضعیت، تقویم و علائم"
      icon="🩸"
    >
      <p>«همراه» جای داشبورد و تقویم و ثبت علائم قبلی است و سه تب دارد (تب علائم فقط در حالت «ردیابی برای خود» دیده می‌شود):</p>
      <ul class="list-inside list-disc space-y-1 text-xs sm:text-sm">
        <li><strong>وضعیت:</strong> نمودار دایره‌ای (روز چرخه، فاز، روزشمار)، دکمه‌ی ثبت شروع/پایان پریود، «ویرایش تاریخ» برای اصلاح زمان واقعی و کارت راهنمای امروز.</li>
        <li><strong>تقویم:</strong> ماه‌های شمسی با رنگ‌های جدا برای پریود، روزهای محتمل، پیش‌بینی دوره‌های بعد و بازه‌ی باروری.</li>
        <li><strong>علائم:</strong> ثبت خلق‌وخو، شدت درد (۰ تا ۴)، میزان خونریزی و یادداشت برای هر روز، همراه با تاریخچه‌ی علائم.</li>
      </ul>
      <div class="space-y-2 mt-2">
        <p><strong>راهنمای امروز:</strong> فهرستی از پیشنهادهای دسته‌بندی‌شده (تسکین، تغذیه، حرکت، استراحت، آرامش ذهن، حمایت و هشدار) است که بر اساس فاز چرخه و علائمِ ثبت‌شده‌ی همان روز تنظیم می‌شود؛ مثلاً درد زیاد، خونریزی سنگین، خلق حساس، نزدیک بودن پریود یا تأخیر آن پیشنهاد مخصوص خودش را بالا می‌آورد. برای شریک، همین موارد به‌صورت «چطور کمک کنم» نوشته شده است. متن‌ها بر پایه‌ی صفحه‌های عمومی NHS و Mayo Clinic‌اند و توصیه‌ی پزشکی نیستند.</p>
        <p><strong>الگوریتم پیش‌بینی:</strong> طول چرخه‌ی بعد با میانگین متحرک وزن‌دار سه چرخه‌ی اخیر (با وزن بیشتر برای آخری) تخمین زده می‌شود. هرچه چرخه‌های بیشتری ثبت کنید، دقت بالاتر می‌رود. بازه‌ی باروری و تخمک‌گذاری فقط تخمین‌اند و جایگزین روش پیشگیری یا آزمایش پزشکی نیستند.</p>
      </div>
    </GuideSection>

    <!-- SECTION 4: Hamyar -->
    <GuideSection
      v-show="isVisible('hamyar', 'همیار مراحل زندگی ازدواج بارداری مادری پدری فرزند دوم لانه خالی ارتباط زوجین چک لیست کوییز جستجو پیشرفت')"
      title="۴. همیار: راهنماهای علمی مراحل زندگی"
      icon="🌱"
    >
      <p>همیار شامل <strong>۸ راهنما و ۷۳ مرحله</strong> است و کاملاً آزاد و بدون رمز در دسترس است. صفحه‌ی همیار دو تب دارد: «مراحل زندگی» و «ارتباط زوجین».</p>
      <div class="grid grid-cols-1 gap-2 sm:grid-cols-2 text-xs mt-2">
        <div class="rounded-xl bg-slate-50 p-2.5 dark:bg-slate-800/60"><span class="font-bold text-amber-700 dark:text-amber-300">💍 آشنایی پیش از ازدواج:</span> معیارها، شناخت عاطفی و خط قرمزها (۸ مرحله).</div>
        <div class="rounded-xl bg-slate-50 p-2.5 dark:bg-slate-800/60"><span class="font-bold text-emerald-700 dark:text-emerald-300">🏡 اوایل ازدواج:</span> گذار به زندگی مشترک، مالی، تقسیم وظایف و حل تعارض (۹ مرحله).</div>
        <div class="rounded-xl bg-slate-50 p-2.5 dark:bg-slate-800/60"><span class="font-bold text-rose-700 dark:text-rose-300">🌸 مادر شدن:</span> از تصمیم تا ماه‌های اول (۱۰ مرحله).</div>
        <div class="rounded-xl bg-slate-50 p-2.5 dark:bg-slate-800/60"><span class="font-bold text-teal-700 dark:text-teal-300">🌱 پدر شدن:</span> از تصمیم تا بزرگسالی فرزند (۱۱ مرحله).</div>
        <div class="rounded-xl bg-slate-50 p-2.5 dark:bg-slate-800/60"><span class="font-bold text-sky-700 dark:text-sky-300">👶 فرزند دوم:</span> فاصله‌گذاری، سلامت مادر و آماده‌سازی فرزند اول (۶ مرحله).</div>
        <div class="rounded-xl bg-slate-50 p-2.5 dark:bg-slate-800/60"><span class="font-bold text-purple-700 dark:text-purple-300">🕊️ لانه‌ی خالی (مادر و پدر):</span> بازتعریف هویت و رابطه بعد از رفتن فرزندان (هر کدام ۸ مرحله).</div>
        <div class="rounded-xl bg-slate-50 p-2.5 dark:bg-slate-800/60 sm:col-span-2"><span class="font-bold text-pink-700 dark:text-pink-300">💑 ارتباط زوجین:</span> شناخت تفاوت‌ها، گفت‌وگوی مؤثر و تعامل عاطفی (۱۳ مرحله، در تب جدا).</div>
      </div>
      <ul class="list-inside list-disc space-y-1 text-xs sm:text-sm">
        <li><strong>جستجوی سراسری</strong> در همه‌ی راهنماها با فیلتر نوع محتوا (چک‌لیست، باور غلط، پرچم قرمز...).</li>
        <li><strong>چک‌لیست تعاملی:</strong> تیک‌ها روی دستگاه ذخیره می‌شوند و درصد پیشرفت هر راهنما روی کارتش و در صفحه‌ی خانه دیده می‌شود.</li>
        <li><strong>باورهای غلط و واقعیت‌ها، علائم هشدار، سؤال برای پزشک/متخصص و کوییز</strong> در هر مرحله.</li>
        <li><strong>نکته‌ی روز:</strong> در صفحه‌ی خانه هر روز یک مورد (کار کوچک چک‌لیست، باور غلط، سؤال گفت‌وگو یا نکته‌ی علمی) از راهنماها پیشنهاد می‌شود.</li>
      </ul>
    </GuideSection>

    <!-- SECTION 5: Hamdel -->
    <GuideSection
      v-show="isVisible('hamdel', 'همدل دفترچه شناخت علایق تاریخ مهم مناسبت یادآور تماس هدیه اشاره قول چالش خاطرات عکس ملاقات آمار pdf جستجو')"
      title="۵. همدل: دفترچه‌ی شناخت و همراهی با شریک"
      icon="💞"
    >
      <p>همدل دفترچه‌ی شخصی شماست تا چیزهایی را که درباره‌ی همسر یا شریکتان می‌دانید یادداشت کنید و در زمان درست به کار ببرید. داده‌ها برای هر فرد جداست و با قفل برنامه رمزنگاری می‌شوند. بخش‌ها در پنج گروه‌اند:</p>
      <ul class="list-inside list-disc space-y-1 text-xs sm:text-sm">
        <li><strong>شناخت او:</strong> علایق، چیزهایی که دوست ندارد، نکات و اندازه‌ها، غذاها و رستوران‌ها، خانواده و دوستان.</li>
        <li><strong>احساسات و روحیه:</strong> ناراحتی‌ها، خوشحالی‌ها (با شدت)، محرک‌های استرس، راه‌های آرام‌کردن او.</li>
        <li><strong>گذشته و آینده:</strong> رویاها و اهداف، تاریخچه و خاطرات مهم.</li>
        <li><strong>تعامل‌ها و تعهدها:</strong> واکنش بعد از هدیه یا قرار، قول‌هایی که داده‌اید، اشاره‌ها («کاش داشتم...»)، تقویم تاریخ‌های مهم، یادآور تماس یا پیام.</li>
        <li><strong>با هم:</strong> فهرست هدیه‌ها (از ایده تا خرید و دادن)، لیست آرزوهای مشترک، ایده‌های پیام محبت‌آمیز، چالش‌های کوچک، نکات و آمادگی قبل از ملاقات و دفترچه‌ی خاطرات.</li>
      </ul>
      <p class="pt-2"><strong>صفحه‌های اختصاصی:</strong></p>
      <ul class="list-inside list-disc space-y-1 text-xs sm:text-sm">
        <li><strong>تقویم تاریخ‌های مهم:</strong> تولد، سالگرد و روز آشنایی با شمارش معکوس، نمای ماهانه‌ی شمسی، تکرار سالانه یا یک‌باره و یادآور تلگرام (۱ ماه، ۱ هفته، ۱ روز قبل و در صورت انتخاب خود روز).</li>
        <li><strong>یادآور تماس یا پیام:</strong> برای روزهای مهم او (امتحان، مصاحبه، سفر...) با تیک «انجام شد».</li>
        <li><strong>چالش‌های کوچک:</strong> چالش چندروزه با چک‌کردن هر روز و نوار پیشرفت؛ چالش‌های آماده را با یک لمس از امروز شروع کنید.</li>
        <li><strong>دفترچه‌ی خاطرات:</strong> نوشتن خاطره با عکس و تایم‌لاین که می‌توانید خوشحالی‌ها، خاطرات، هدیه‌ها و... را به آن اضافه یا از آن حذف کنید.</li>
        <li><strong>نکات قبل از ملاقات:</strong> برای مهمانی، سفر، قرار خاص یا دیدار خانوادگی، خلاصه‌ای از خطوط قرمز، محرک‌های استرس و راه‌های آرام‌کردن، قول‌های باز و یادداشت‌های اختصاصی خودتان را یک‌جا می‌بینید.</li>
        <li><strong>آمار و PDF:</strong> روحیه‌ی ۳۰ روز اخیر، روند خوشحالی و ناراحتی و گزارش PDF کامل (با یا بدون عکس).</li>
      </ul>
      <p class="pt-2"><strong>امکانات عمومی:</strong> جستجوی سراسری در همه‌ی یادداشت‌ها، فیلتر بر اساس گروه، نمونه‌ی آماده (Preset) برای افزودن سریع، و افزودن دسته‌ی دلخواه در فیلدهای انتخابی. بخش «همدل» در صفحه‌ی خانه هم پیشنهاد روزانه می‌دهد.</p>
    </GuideSection>

    <!-- SECTION 6: Games -->
    <GuideSection
      v-show="isVisible('games', 'هم‌راز بازی ها پوزیشن مار و پله تاس جرئت حقیقت دو سوالی کارت های گفت و گو خراشیدنی چالش روزانه هفتگی رمز')"
      title="۶. هم‌راز: بازی‌ها و چالش‌های دونفره"
      icon="🎲"
    >
      <p>در صفحه‌ی «هم‌راز» این بازی‌ها بدون رمز در دسترس‌اند:</p>
      <ul class="list-inside list-disc space-y-1 text-xs sm:text-sm">
        <li><strong>پیشنهاد و چالش‌های روزانه و هفتگی:</strong> برنامه‌ی هفتگی از شنبه با یک چالش برای هر روز؛ تعویض چالش (رول مجدد)، ثبت روز آف (مهمانی، تعطیلی، مشغله)، ثبت نتیجه (انجام شد / رد شد / آف) با یادداشت، افزودن چالش دلخواه، فیلتر زمانی (روز، شب، آخر هفته، تعطیل) و مرور هفته‌های قبل. وضعیت امروز را در صفحه‌ی خانه هم می‌بینید و با یک لمس «انجام شد» را می‌زنید.</li>
        <li><strong>کارت‌های گفت‌وگوی عمیق:</strong> سؤال در پنج دسته: فردی، زوج، خانواده، صمیمیت، گذشته و آینده.</li>
        <li><strong>تاس دوتایی:</strong> یک تاس عمل و یک تاس محل؛ وجه‌ها قابل ویرایش‌اند.</li>
        <li><strong>جرئت یا حقیقت:</strong> نوبتی، با سه سطح شدت (ملایم، متوسط، جسورانه) و امکان افزودن کارت خودتان.</li>
        <li><strong>بازی دو سؤالی:</strong> سؤال درباره‌ی نحوه و مدت لمس دلخواه، با تایمر و جابه‌جایی نقش‌ها.</li>
        <li><strong>کارت‌های خراشیدنی:</strong> ورقی از ایده‌های قرار و ماجراجویی؛ با انگشت می‌خراشید، انجام می‌دهید و علامت می‌زنید، با دسته‌بندی (بیرون، ماجراجویی، خانه، صمیمی) و کارت دلخواه.</li>
      </ul>
      <p class="pt-2"><strong>بخش‌های قفل‌دار:</strong> «مار و پله‌ی زناشویی» (با تخته‌ی قابل ویرایش) و «کاتالوگ پوزیشن‌ها» (رمزگذاری‌شده، با جستجو، فیلتر، انتخاب تصادفی با تنظیمات حذف و تایمر خودکار) فقط بعد از وارد کردن «رمز بخش هم‌راز» در تنظیمات (تب «امنیت و قفل») نمایش داده می‌شوند. «پاک کردن رمز» دوباره آن‌ها را مخفی می‌کند.</p>
      <p class="text-xs text-slate-500">💡 رمز هم‌راز با «قفل برنامه» فرق دارد؛ اولی فقط نمایش بخش‌های قفل‌دار را کنترل می‌کند و دومی داده‌های همدل را رمزنگاری می‌کند.</p>
    </GuideSection>

    <!-- SECTION 7: Lock & security -->
    <GuideSection
      v-show="isVisible('security', 'قفل برنامه رمزنگاری aes رمز عبور قفل خودکار اثرانگشت passkey رمزنگاری مجدد حریم خصوصی')"
      title="۷. قفل و حریم خصوصی"
      icon="🔒"
    >
      <p>در تنظیمات، تب «امنیت و قفل»، می‌توانید قفل برنامه را با یک رمز فعال کنید. با فعال بودن قفل، یادداشت‌ها و عکس‌های همدل با <strong>AES-256-GCM</strong> رمزنگاری می‌شوند و بدون رمز خوانده نمی‌شوند.</p>
      <ul class="list-inside list-disc space-y-1 text-xs sm:text-sm">
        <li><strong>قفل خودکار:</strong> هنگام خروج از برنامه، یا بعد از ۱، ۵، ۱۵ یا ۳۰ دقیقه دوری (پیش‌فرض ۵ دقیقه). دکمه‌ی «همین حالا قفل کن» هم هست.</li>
        <li><strong>ورود با اثرانگشت:</strong> اگر دستگاه پشتیبانی کند، می‌توانید حسگر دستگاه (Passkey) را برای باز کردن سریع قفل فعال کنید.</li>
        <li><strong>تغییر رمز، رمزنگاری مجدد داده‌ها و غیرفعال‌سازی قفل</strong> در همان بخش انجام می‌شود. رمز قابل بازیابی نیست؛ آن را فراموش نکنید.</li>
      </ul>
    </GuideSection>

    <!-- SECTION 8: Data & backup -->
    <GuideSection
      v-show="isVisible('security', 'پشتیبان بکاپ خروجی json بازیابی pdf گزارش google drive گوگل درایو ابری همگام سازی رمزنگاری تضاد بازگردانی')"
      title="۸. داده‌ها و پشتیبان‌گیری"
      icon="☁️"
    >
      <p>در تنظیمات، تب «داده و پشتیبان»، دو راه نگهداری از اطلاعات دارید:</p>
      <p class="pt-1"><strong>الف) مدیریت داده‌ها (دستی):</strong></p>
      <ul class="list-inside list-disc space-y-1 text-xs sm:text-sm">
        <li><strong>بکاپ رمزنگاری‌شده</strong> از کل داده‌ها (PBKDF2 + AES-256-GCM) — روش پیشنهادی.</li>
        <li><strong>خروجی JSON ساده</strong> بدون رمز؛ فقط در جای امن نگه دارید.</li>
        <li><strong>بازیابی</strong> از فایل ساده یا رمزنگاری‌شده؛ بازیابی داده‌های فعلی را جایگزین می‌کند.</li>
        <li><strong>گزارش PDF پریود</strong> برای ۶ ماه اخیر، مناسب نشان دادن به پزشک.</li>
      </ul>
      <p class="pt-2"><strong>ب) پشتیبان‌گیری خودکار در Google Drive:</strong></p>
      <ul class="list-inside list-disc space-y-1 text-xs sm:text-sm">
        <li>نسخه در پوشه‌ی مخفی و اختصاصی همین برنامه در Drive شخصی شما ذخیره می‌شود و بعد از هر تغییر خودکار به‌روز می‌شود.</li>
        <li><strong>رمزنگاری سرتاسری (اختیاری)</strong> با گذرواژه‌ی شما؛ گذرواژه قابل بازیابی نیست.</li>
        <li>اگر نسخه‌ی ابری با نسخه‌ی دستگاه فرق داشته باشد، پنجره‌ی تصمیم‌گیری می‌آید و بین «ادغام» و «جایگزینی» انتخاب می‌کنید.</li>
        <li>پیش از هر بازیابی ابری یک نسخه‌ی محلی گرفته می‌شود و می‌توانید «بازگردانی» کنید.</li>
        <li>در صورت خطای همگام‌سازی (فقط وقتی آنلاین هستید) نوار هشدار پایین صفحه می‌آید که از تنظیمات قابل خاموش کردن است.</li>
      </ul>
    </GuideSection>

    <!-- SECTION 9: Telegram -->
    <GuideSection
      v-show="isVisible('security', 'یادآور تلگرام ربات بات ساعت ۶ صبح پریود تاریخ تماس')"
      title="۹. یادآور در تلگرام"
      icon="🔔"
    >
      <p>در تنظیمات، تب «یادآور»، می‌توانید یادآور تلگرام را فعال کنید. یادآورها <strong>ساعت ۶ صبح</strong> ارسال می‌شوند:</p>
      <ul class="list-inside list-disc space-y-1 text-xs sm:text-sm">
        <li>پریود: یک روز قبل از شروع، روز شروع و روز پایان.</li>
        <li>همدل: تاریخ‌های مهم (طبق گزینه‌ی یادآور هر مورد) و یادآورهای تماس یا پیام.</li>
      </ul>
      <p class="text-xs sm:text-sm leading-6">اتصال دو مرحله دارد: باز کردن بات و زدن Start، سپس «اتصال را بررسی کن». فقط نوع یادآور و تاریخ، و برای همدل عنوان کوتاهی که خودتان نوشته‌اید به سرور یادآور فرستاده می‌شود و این عنوان‌ها روی سرور رمزنگاری نمی‌شوند؛ پس در عنوان‌ها اطلاعات حساس ننویسید. با «قطع اتصال» همه‌ی یادآورها حذف می‌شوند.</p>
    </GuideSection>

    <!-- SECTION 10: Settings -->
    <GuideSection
      v-show="isVisible('settings', 'تنظیمات تب نام نمایشی تم تیره روشن خروج پاک کردن کامل اطلاعات درباره')"
      title="۱۰. نقشه‌ی تنظیمات"
      icon="⚙️"
    >
      <p>تنظیمات به پنج تب تقسیم شده که از بالای صفحه انتخاب می‌شوند:</p>
      <ul class="list-inside list-disc space-y-1 text-xs sm:text-sm">
        <li><strong>عمومی:</strong> نام نمایشی (فقط برای پیام‌های داخلی برنامه) و تم روشن/تیره.</li>
        <li><strong>یادآور:</strong> اتصال به تلگرام.</li>
        <li><strong>امنیت و قفل:</strong> قفل برنامه و رمز بخش هم‌راز.</li>
        <li><strong>داده و پشتیبان:</strong> Google Drive، بکاپ دستی، بازیابی و PDF.</li>
        <li><strong>حساب و درباره:</strong> «خروج» (فقط بازگشت به انتخاب نقش، بدون حذف داده) و «پاک‌کردن کامل اطلاعات» (حذف همه‌ی افراد و داده‌ها؛ با تأیید جداگانه) و معرفی برنامه.</li>
      </ul>
    </GuideSection>

    <!-- SECTION 11: Health Encyclopedia -->
    <GuideSection
      v-show="isVisible('health', 'چرخه قاعدگی فازها لوتئال فولیکولار تخمک گذاری طبیعی')"
      title="۱۱. چرخه قاعدگی طبیعی چیست"
      icon="🦩"
    >
      <p>چرخه قاعدگی از روز اول یک پریود تا روز اول پریود بعدی محاسبه می‌شود و شامل ۴ فاز است:</p>
      <ul class="list-inside list-disc space-y-1 text-xs sm:text-sm mt-2">
        <li><strong>قاعدگی (Menstrual):</strong> روزهای خونریزی، معمولاً ۲ تا ۷ روز. افت هورمون‌های پروژسترون و استروژن.</li>
        <li><strong>فولیکولار (Follicular):</strong> از پایان قاعدگی تا تخمک‌گذاری؛ سطح انرژی معمولاً رو به افزایش است و هورمون استروژن بالا می‌رود.</li>
        <li><strong>تخمک‌گذاری (Ovulation):</strong> حدود روز ۱۴ قبل از شروع پریود بعدی؛ بالاترین احتمال باروری و افزایش میل جنسی.</li>
        <li><strong>لوتئال (Luteal):</strong> از تخمک‌گذاری تا شروع پریود بعدی؛ پروژسترون غالب می‌شود و ممکن است علائم خلقی و جسمی پیش از قاعدگی (PMS) بروز کند.</li>
      </ul>

      <table class="mt-3 w-full border-collapse overflow-hidden rounded-lg text-right text-xs sm:text-sm">
        <thead>
          <tr class="bg-slate-100 dark:bg-slate-800">
            <th class="p-2.5 font-medium text-slate-700 dark:text-slate-200">پارامتر</th>
            <th class="p-2.5 font-medium text-slate-700 dark:text-slate-200">مقدار طبیعی</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in normalRanges" :key="row.label" class="border-t border-slate-100 dark:border-slate-800">
            <td class="p-2 text-slate-600 dark:text-slate-300">{{ row.label }}</td>
            <td class="p-2 font-medium text-slate-800 dark:text-slate-100">{{ row.value }}</td>
          </tr>
        </tbody>
      </table>
    </GuideSection>

    <!-- SECTION 12: Danger & Emergency Signs -->
    <GuideSection
      v-show="isVisible('health', 'هشدار پزشک اورژانس خونریزی شدید درد خطر لخته')"
      title="۱۲. چه زمانی باید نگران بود (برای خانم‌ها)"
      icon="⚠️"
    >
      <p>موارد زیر «غیرعادی» تلقی می‌شوند و بهتر است برای بررسی به پزشک زنان مراجعه کنید:</p>
      <ul class="list-inside list-disc space-y-1 text-xs sm:text-sm mt-2">
        <li v-for="sign in dangerSigns" :key="sign">{{ sign }}</li>
      </ul>

      <p class="mt-4 font-bold text-rose-600 dark:text-rose-400">🚨 این موارد نیاز به مراجعه فوری و اورژانسی دارند:</p>
      <ul class="list-inside list-disc space-y-1 text-xs sm:text-sm text-rose-600 dark:text-rose-300">
        <li v-for="sign in emergencySigns" :key="sign">{{ sign }}</li>
      </ul>
    </GuideSection>

    <!-- SECTION 13: Partner Guide -->
    <GuideSection
      v-show="isVisible('health', 'راهنما برای شریک مرد همراهی صبوری همسر pms')"
      title="۱۳. راهنما برای شریک (مرد)"
      icon="🤝"
    >
      <p>درک این نکته که نوسانات خلقی و جسمی در فازهای قاعدگی و لوتئال ریشه زیستی و هورمونی دارند، نه انتخاب شخصی، اولین قدم است.</p>
      <ul class="list-inside list-disc space-y-1 text-xs sm:text-sm mt-2">
        <li><strong>در روزهای قاعدگی:</strong> بدون اینکه از او خواسته شود، کارهای خانه را بیشتر بر عهده بگیرید و محیطی آرام برای استراحت فراهم کنید.</li>
        <li>کیسه آب گرم یا مسکن معمول او را از قبل آماده نگه دارید.</li>
        <li><strong>در فاز لوتئال (چند روز قبل از پریود):</strong> نسبت به حساسیت‌های روحی صبورتر باشید و از عبارت‌های طعنه‌آمیز مثل «حتماً وقتشه» یا شوخی درباره PMS خودداری کنید.</li>
        <li>پرسیدن صمیمانه «الان چه کمکی از دستم برمی‌آید؟» از حدس زدن بسیار موثرتر است.</li>
        <li>فضای آرام، کم‌استرس و بدون بحث‌های مالی یا خانوادگی حساس در این روزها بهترین هدیه است.</li>
      </ul>

      <p class="mt-3 font-semibold text-slate-800 dark:text-slate-100">چه زمانی باید او را به مراجعه به پزشک تشویق کنید:</p>
      <p class="text-xs sm:text-sm leading-6">
        اگر متوجه شدید خونریزی او بیش از حد سنگین است (خیس شدن پد در کمتر از یک ساعت)، بیش از ۷ روز طول کشیده، یا علائم هشداردهنده‌ای مثل سرگیجه، غش کردن، رنگ‌پریدگی شدید یا تنگی نفس دارد، او را با مهربانی به مراجعه فوری به پزشک یا اورژانس تشویق کرده و همراهی‌اش کنید.
      </p>
    </GuideSection>

    <!-- Footer disclaimer -->
    <p class="text-xs text-slate-400 dark:text-slate-500 text-center pb-6">
      مراجع علمی: کالج آمریکایی متخصصان زنان و زایمان (ACOG)، مایو کلینیک (Mayo Clinic)، دستورالعمل‌های MSD و CDC. اطلاعات این اپلیکیشن جنبه آموزشی دارد و جایگزین تشخیص یا توصیه پزشک نیست.
    </p>
  </div>
</template>
