<script setup lang="ts">
import { ref } from "vue";
import GuideSection from "@presentation/components/guide/GuideSection.vue";

const activeCategory = ref<string>("all");
const searchQuery = ref<string>("");

const categories = [
  { id: "all", label: "همه موضوعات", icon: "📑" },
  { id: "tracker", label: "ردیاب و تقویم", icon: "📱" },
  { id: "hamyar", label: "همیار مراحل زندگی", icon: "🌱" },
  { id: "hamdel", label: "همدل و روابط", icon: "💞" },
  { id: "games", label: "بازی‌ها و پوزیشن‌ها", icon: "🎲" },
  { id: "security", label: "امنیت، داده و یادآور", icon: "🛡️" },
  { id: "health", label: "دانشنامه سلامت و شریک", icon: "🩺" },
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
            آموزش کار با تمام بخش‌های برنامه، دانشنامه علمی سلامت قاعدگی و نکات همراهی شریک
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

    <!-- SECTION 1: Tracker & Calendar -->
    <GuideSection
      v-show="isVisible('tracker', 'داشبورد تقویم ثبت پریود الگوریتم پیش بینی علائم')"
      title="۱. داشبورد، تقویم و ردیابی قاعدگی"
      icon="📱"
    >
      <p>
        ماهک یک ردیاب سیکل قاعدگی آفلاین و محلی (Local-first) است؛ یعنی تمام داده‌ها فقط در حافظه مرورگر و دستگاه شما ذخیره می‌شوند و به هیچ سروری فرستاده نمی‌شوند.
      </p>
      <div class="space-y-2 mt-2">
        <p><strong>حالت دوگانه نقش:</strong></p>
        <ul class="list-inside list-disc space-y-1 text-xs sm:text-sm">
          <li><strong>«ردیابی برای خود»:</strong> دسترسی کامل به ثبت شروع/پایان پریود، ویرایش تاریخ‌ها و ثبت علائم روزانه جسمی و روانی.</li>
          <li><strong>«ردیابی شریک»:</strong> نمایی اختصاصی برای همسر یا شریک عاطفی که فقط فاز فعلی، تاریخ‌های پیش‌بینی‌شده و روزهای باقیمانده تا پریود بعدی را با راهنمایی‌های رفتاری نشان می‌دهد.</li>
        </ul>

        <p class="pt-2"><strong>داشبورد و نمودار دایره‌ای:</strong> روز جاری چرخه، فاز فعال (قاعدگی، فولیکولار، تخمک‌گذاری، لوتئال)، وضعیت باروری و روزشمار معکوس را به صورت تصویری نشان می‌دهد.</p>

        <p><strong>الگوریتم پیش‌بینی:</strong> طول چرخه بعدی با میانگین متحرک وزن‌دار از ۳ سیکل اخیر محاسبه می‌شود (آخرین سیکل بیشترین وزن را دارد)، بنابراین با گذشت زمان و ثبت دوره‌های بیشتر، پیش‌بینی‌ها هوشمندانه‌تر و دقیق‌تر می‌شوند.</p>

        <p><strong>تقویم شمسی جلالی:</strong> نمایش کامل ماه‌های شمسی همراه با رنگ‌های مجزا برای روزهای پریود، روزهای احتمالی ادامه، پیش‌بینی دوره‌های آینده و پنجره باروری (Fertile Window).</p>

        <p><strong>ثبت علائم روزانه:</strong> ثبت نوسانات خلق‌وخو، شدت درد، حجم خونریزی و یادداشت‌های شخصی در هر روز دلخواه.</p>
      </div>
    </GuideSection>

    <!-- SECTION 2: Hamyar (Life Stages Guides) -->
    <GuideSection
      v-show="isVisible('hamyar', 'همیار مراحل مختلف زندگی ازدواج بارداری مادری پدری فرزند دوم لانه خالی چک لیست کوییز')"
      title="۲. بخش «همیار»: راهنمای گام‌به‌گام مراحل زندگی"
      icon="🌱"
    >
      <p>
        بخش <strong>«همیار»</strong> دانشنامه جامع و شواهد‌محور اپلیکیشن برای مهم‌ترین مقاطع و گذرگاه‌های زندگی مشترک است. این بخش کاملاً آزاد، رایگان و بدون نیاز به رمز عبور در دسترس شماست.
      </p>

      <div class="space-y-2 mt-2">
        <p><strong>راهنماهای موجود در همیار:</strong></p>
        <div class="grid grid-cols-1 gap-2 sm:grid-cols-2 text-xs">
          <div class="rounded-xl bg-slate-50 p-2.5 dark:bg-slate-800/60">
            <span class="font-bold text-amber-700 dark:text-amber-300">💍 آشنایی پیش از ازدواج:</span>
            معیارهای انتخاب، شناخت عاطفی، مرزبندی‌ها و خط قرمزهای مهم.
          </div>
          <div class="rounded-xl bg-slate-50 p-2.5 dark:bg-slate-800/60">
            <span class="font-bold text-emerald-700 dark:text-emerald-300">🏡 اوایل ازدواج:</span>
            گذار به زندگی مشترک، مدیریت مالی، تقسیم وظایف و حل تعارض.
          </div>
          <div class="rounded-xl bg-slate-50 p-2.5 dark:bg-slate-800/60">
            <span class="font-bold text-rose-700 dark:text-rose-300">🌸 مادر شدن:</span>
            آمادگی، سه‌ماهه‌های بارداری، زایمان، ریکاوری، شیردهی و مراقبت نوزاد.
          </div>
          <div class="rounded-xl bg-slate-50 p-2.5 dark:bg-slate-800/60">
            <span class="font-bold text-teal-700 dark:text-teal-300">🌱 پدر شدن و والدگری:</span>
            همراهی در بارداری همسر، نوزادی، کودکی، نوجوانی تا استقلال فرزند.
          </div>
          <div class="rounded-xl bg-slate-50 p-2.5 dark:bg-slate-800/60">
            <span class="font-bold text-sky-700 dark:text-sky-300">👶 فرزند دوم:</span>
            فاصله‌گذاری علمی، سلامت مادر، آماده‌سازی فرزند اول و پیشگیری از حسادت.
          </div>
          <div class="rounded-xl bg-slate-50 p-2.5 dark:bg-slate-800/60">
            <span class="font-bold text-purple-700 dark:text-purple-300">🕊️ لانه خالی (مادر و پدر):</span>
            روان‌شناسی رفتن فرزندان، بازتعریف هویت فردی، رابطه زناشویی، یائسگی و پدربزرگ/مادربزرگی.
          </div>
        </div>

        <p class="pt-2"><strong>قابلیت‌های منحصربه‌فرد همیار:</strong></p>
        <ul class="list-inside list-disc space-y-1 text-xs sm:text-sm">
          <li><strong>جستجوی سراسری:</strong> جستجوی آنی در تمام ۶۰ مرحله و صدها مبحث علمی، چک‌لیست و کوییز.</li>
          <li><strong>چک‌لیست تعاملی:</strong> امکان تیک زدن اقدامات عملی و ذخیره خودکار وضعیت روی دستگاه شما.</li>
          <li><strong>باورهای غلط در برابر حقایق علمی:</strong> بررسی خطاهای فکری رایج با استناد به شواهد معتبر.</li>
          <li><strong>علائم هشدار و پرچم قرمز:</strong> هشدارهای روان‌شناختی و پزشکی برای مراجعه به متخصص.</li>
          <li><strong>خودآزمایی و کوییز:</strong> سوالات تعاملی برای محک زدن یادگیری و آمادگی در هر مرحله.</li>
        </ul>
      </div>
    </GuideSection>

    <!-- SECTION 3: Hamdel (Couple Connection) -->
    <GuideSection
      v-show="isVisible('hamdel', 'همدل دفترچه خاطرات قرارهای عاشقانه چالش های صمیمیت جلسات دونفره آمار')"
      title="۳. بخش «همدل»: صمیمیت و همراهی عاطفی زوجین"
      icon="💞"
    >
      <p>
        بخش <strong>«همدل»</strong> بستری امن و آرام برای تقویت مکالمه، ابراز احساسات و پیوند عاطفی زوجین است:
      </p>

      <ul class="list-inside list-disc space-y-1 text-xs sm:text-sm mt-2">
        <li><strong>دفترچه خاطرات مشترک (Diary):</strong> ثبت و دسته‌بندی یادداشت‌های قدردانی، غم‌ها و دلخوری‌ها، احساسات ناگفته و درخواست‌های صمیمانه با تاریخ و برچسب‌های احساسی.</li>
        <li><strong>قرارهای عاشقانه (Date Ideas):</strong> ایده‌های جذاب و برنامه‌ریزی‌شده برای وقت‌گذرانی دونفره، همراه با ثبت خاطرات هر قرار.</li>
        <li><strong>چالش‌های صمیمیت (Challenges):</strong> چالش‌های هفتگی و تمرین‌های ساده برای بهبود زبان عشق، شوخ‌طبعی و ابراز محبت.</li>
        <li><strong>جلسات دونفره (Check-ins):</strong> راهنمای برگزاری جلسات ماهیانه دوستانه برای گفت‌وگو در مورد رابطه، امور مالی و دغدغه‌های مشترک قبل از انباشته شدن دلخوری‌ها.</li>
        <li><strong>آمار و خلاصه همدل:</strong> بررسی روند احساسات ثبت‌شده و بازتاب رشد صمیمیت در طول زمان.</li>
      </ul>
    </GuideSection>

    <!-- SECTION 4: Games & Positions -->
    <GuideSection
      v-show="isVisible('games', 'بازی ها پوزیشن مار و پله تاس جرئت حقیقت دو سوالی کارت های گفت و گو خراشیدنی رمز')"
      title="۴. بازی‌های دونفره و کاتالوگ پوزیشن‌ها"
      icon="🎲"
    >
      <p>
        مجموعه‌ای از بازی‌های متنوع زناشویی برای تنوع، نشاط و گفت‌وگوی عمیق‌تر دونفره، محافظت‌شده با رمز عبور اختیاری:
      </p>

      <ul class="list-inside list-disc space-y-1 text-xs sm:text-sm mt-2">
        <li><strong>مار و پله زناشویی:</strong> تخته مار و پله با چالش‌های عاشقانه و امکان شخصی‌سازی متن خانه‌ها.</li>
        <li><strong>تاس دوتایی:</strong> تاس عمل و تاس محل با امکان پرتاب تصادفی و وجه‌های قابل ویرایش.</li>
        <li><strong>جرئت یا حقیقت:</strong> سه سطح شدت (ملایم، متوسط، جسورانه) همراه با امکان افزودن کارت‌های خودتان.</li>
        <li><strong>بازی دو سؤالی:</strong> مکالمه درباره ترجیحات لمس و صمیمیت با تایمر داخلی و جابجایی نقش‌ها.</li>
        <li><strong>کارت‌های گفت‌وگوی عمیق:</strong> ده‌ها سؤال در دسته‌های فردی، زوج، خانواده، صمیمیت و گذشته/آینده.</li>
        <li><strong>کارت‌های خراشیدنی:</strong> کشف ایده‌های عاشقانه با خراشیدن مجازی کارت‌ها با انگشت.</li>
        <li><strong>کاتالوگ پوزیشن‌ها:</strong> کاتالوگ تصویری با فیلتر سطح دشواری، انتخاب تصادفی هوشمند و تایمر خودکار.</li>
      </ul>
      <p class="mt-2 text-xs text-slate-500">
        💡 <strong>نکته امنیتی:</strong> کاتالوگ پوزیشن‌ها و تنظیمات خصوصی بازی‌ها با الگوریتم استاندارد AES-GCM روی دستگاه رمزگذاری شده‌اند.
      </p>
    </GuideSection>

    <!-- SECTION 5: Security, Data, Telegram -->
    <GuideSection
      v-show="isVisible('security', 'امنیت رمز قفل خودکار پشتیبان خروجی json گزارش pdf تلگرام ربات همگام سازی ابری')"
      title="۵. امنیت، پشتیبان‌گیری و یادآورهای تلگرام"
      icon="🛡️"
    >
      <div class="space-y-2">
        <p><strong>حفظ حریم خصوصی و ذخیره‌سازی محلی:</strong> ماهک هیچ سرور مرکزی برای ذخیره اطلاعات خصوصی شما ندارد. داده‌ها در IndexedDB مرورگر دستگاه شما محافظت می‌شوند.</p>

        <p><strong>قفل خودکار و رمز عبور:</strong> از بخش تنظیمات می‌توانید رمز عبور تنظیم کنید. با ترک برنامه، بعد از مدت‌زمان تعیین‌شده قفل خودکار فعال می‌شود تا خیالتان از محرمانگی اطلاعات راحت باشد.</p>

        <p><strong>پشتیبان‌گیری و خروجی داده‌ها:</strong></p>
        <ul class="list-inside list-disc space-y-1 text-xs sm:text-sm">
          <li><strong>خروجی JSON:</strong> یک نسخه کامل از تمام اطلاعات چرخه‌ها، علائم و یادداشت‌ها دانلود کنید تا در دستگاه دیگر بازیابی کنید.</li>
          <li><strong>گزارش PDF پزشکی:</strong> دریافت فایل شکیل PDF از خلاصه سیکل‌های ۶ ماه گذشته برای ارائه به پزشک متخصص زنان.</li>
        </ul>

        <p class="pt-2"><strong>یادآورهای محرمانه تلگرام:</strong></p>
        <p class="text-xs sm:text-sm leading-6">
          می‌توانید برنامه را به ربات تلگرام اختصاصی متصل کنید تا چند روز قبل از شروع پریود یا برای قرارهای همدل به شما پیام یادآوری بفرستد، بدون اینکه پیام‌ها در اعلان‌های عمومی گوشی فاش شوند.
        </p>
      </div>
    </GuideSection>

    <!-- SECTION 6: Health Encyclopedia -->
    <GuideSection
      v-show="isVisible('health', 'چرخه قاعدگی فازها لوتئال فولیکولار تخمک گذاری طبیعی')"
      title="۶. چرخه قاعدگی طبیعی چیست"
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

    <!-- SECTION 7: Danger & Emergency Signs -->
    <GuideSection
      v-show="isVisible('health', 'هشدار پزشک اورژانس خونریزی شدید درد خطر لخته')"
      title="۷. چه زمانی باید نگران بود (برای خانم‌ها)"
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

    <!-- SECTION 8: Partner Guide -->
    <GuideSection
      v-show="isVisible('health', 'راهنما برای شریک مرد همراهی صبوری همسر pms')"
      title="۸. راهنما برای شریک (مرد)"
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
