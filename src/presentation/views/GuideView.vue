<script setup lang="ts">
import GuideSection from "@presentation/components/guide/GuideSection.vue";

/**
 * GuideView - a single reference page covering (1) how the app itself
 * works, and (2) general menstrual-health education for both the person
 * tracking and their partner, including normal reference ranges and
 * warning signs that warrant medical attention.
 *
 * Reference ranges/warning signs are based on ACOG, Mayo Clinic, MSD
 * Manuals and CDC patient-education material (see sources listed at the
 * bottom of the page) — general information only, not a diagnosis.
 */
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
</script>

<template>
  <div class="flex flex-col gap-4">
    <h1 class="text-xl font-semibold text-slate-900 dark:text-slate-100">راهنما</h1>

    <GuideSection title="این اپلیکیشن چطور کار می‌کند" icon="📱">
      <p>
        این اپلیکیشن یک ردیاب سیکل قاعدگی آفلاین است؛ یعنی تمام داده‌های شما (تاریخ‌های پریود، علائم) فقط روی همین دستگاه و در حافظه سیستم شما ذخیره می‌شود و به هیچ سروری ارسال نمی‌شود.
      </p>
      <p><strong>حالت دوگانه:</strong> در ابتدا نقش خود را انتخاب می‌کنید: «ردیابی برای خود» با دسترسی کامل به ثبت پریود و علائم، یا «ردیابی شریک» با نمای فقط‌خواندنی که فقط تاریخ‌ها، فاز فعلی و روزهای باقیمانده را نشان می‌دهد.</p>
      <p><strong>داشبورد:</strong> نمودار دایره‌ای روز فعلی چرخه را از کل طول چرخه پیش‌بینی‌شده نشان می‌دهد، همراه با نام فاز فعلی (قاعدگی، فولیکولار، تخمک‌گذاری، لوتئال) و شمارش معکوس تا پریود بعدی.</p>
      <p><strong>ثبت پریود:</strong> با دکمه «ثبت شروع/پایان پریود» تاریخ ثبت می‌شود. اگر تاریخ اشتباه ثبت شده، از «ویرایش تاریخ» برای اصلاح شروع یا پایان استفاده کنید؛ این کار بلافاصله همه پیش‌بینی‌های آینده را بازمحاسبه می‌کند.</p>
      <p><strong>الگوریتم پیش‌بینی:</strong> طول چرخه بعدی با میانگین متحرک وزن‌دار از ۳ سیکل اخیر محاسبه می‌شود (آخرین سیکل وزن بیشتری دارد)، بنابراین هرچه داده بیشتری ثبت کنید، پیش‌بینی‌ها دقیق‌تر می‌شوند.</p>
      <p><strong>تقویم:</strong> بازه فعلی پریود (تأییدشده و ادامه احتمالی)، پریودهای قبلی، پریود پیش‌بینی‌شده و پنجره باروری هر کدام با رنگ جداگانه مشخص شده‌اند (راهنمای رنگ‌ها زیر خود تقویم قابل مشاهده است).</p>
      <p><strong>ثبت علائم:</strong> در حالت «ردیابی برای خود» می‌توانید هر روز خلق‌وخو، سطح درد و میزان خونریزی را ثبت کنید.</p>
      <p><strong>مدیریت داده‌ها:</strong> از تنظیمات می‌توانید کل داده‌ها را به‌صورت JSON خروجی/ورودی بگیرید یا یک گزارش PDF از ۶ ماه اخیر دریافت کنید.</p>
      <p><strong>تم و نام:</strong> تم روشن/تیره و نام نمایشی هم از صفحه تنظیمات قابل تغییر است.</p>
    </GuideSection>

    <GuideSection title="چرخه قاعدگی طبیعی چیست" icon="🦩">
      <p>چرخه قاعدگی از روز اول یک پریود تا روز اول پریود بعدی محاسبه می‌شود و شامل ۴ فاز است:</p>
      <ul class="list-inside list-disc">
        <li><strong>قاعدگی (Menstrual):</strong> روزهای خونریزی، معمولاً ۲ تا ۷ روز.</li>
        <li><strong>فولیکولار (Follicular):</strong> از پایان قاعدگی تا تخمک‌گذاری؛ سطح انرژی معمولاً رو به افزایش است.</li>
        <li><strong>تخمک‌گذاری (Ovulation):</strong> حدود روز ۱۴ قبل از شروع پریود بعدی؛ بالاترین احتمال باروری.</li>
        <li><strong>لوتئال (Luteal):</strong> از تخمک‌گذاری تا شروع پریود بعدی؛ محل بروز علائم PMS.</li>
      </ul>
      <table class="mt-2 w-full border-collapse overflow-hidden rounded-lg text-right text-sm">
        <thead>
          <tr class="bg-slate-100 dark:bg-slate-800">
            <th class="p-2 font-medium text-slate-700 dark:text-slate-200">پارامتر</th>
            <th class="p-2 font-medium text-slate-700 dark:text-slate-200">مقدار طبیعی</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in normalRanges" :key="row.label" class="border-t border-slate-100 dark:border-slate-800">
            <td class="p-2 text-slate-600 dark:text-slate-300">{{ row.label }}</td>
            <td class="p-2 text-slate-800 dark:text-slate-100">{{ row.value }}</td>
          </tr>
        </tbody>
      </table>
    </GuideSection>

    <GuideSection title="چه زمانی باید نگران بود (برای خانم‌ها)" icon="⚠️">
      <p>موارد زیر «غیرعادی» تلقی می‌شوند و بهتر است برای بررسی به پزشک زنان مراجعه کنید:</p>
      <ul class="list-inside list-disc">
        <li v-for="sign in dangerSigns" :key="sign">{{ sign }}</li>
      </ul>
      <p class="mt-2 font-medium text-rose-600 dark:text-rose-300">این موارد نیاز به مراجعه فوری/اورژانسی دارند:</p>
      <ul class="list-inside list-disc text-rose-600 dark:text-rose-300">
        <li v-for="sign in emergencySigns" :key="sign">{{ sign }}</li>
      </ul>
    </GuideSection>

    <GuideSection title="راهنما برای شریک (مرد)" icon="🤝">
      <p>درک این نکته که تغییرات خلقی و جسمی در فاز قاعدگی و لوتئال ریشه هورمونی دارند، نه انتخاب شخصی، اولین قدم است.</p>
      <ul class="list-inside list-disc">
        <li>در روزهای قاعدگی، بدون اینکه از او خواسته شود، کارهای خانه را بیشتر بر عهده بگیرید.</li>
        <li>کیسه آب گرم یا مسکن معمول او را از قبل آماده نگه دارید.</li>
        <li>در فاز لوتئال (چند روز قبل از پریود)، نسبت به تغییرات خلقی صبورتر باشید و از عبارت‌هایی مثل «حتماً وقتشه» یا شوخی درباره PMS خودداری کنید؛ این حرف‌ها معمولاً احساسات را نادیده می‌گیرند.</li>
        <li>پرسیدن ساده «الان چه کمکی از دستم برمی‌آید؟» از حدس زدن موثرتر است.</li>
        <li>فضای آرام، کم‌استرس و بدون بحث‌های حساس در این روزها کمک بزرگی است.</li>
      </ul>
      <p class="mt-2 font-medium text-slate-800 dark:text-slate-100">چه زمانی باید نگران باشید و او را به مراجعه به پزشک تشویق کنید:</p>
      <p>اگر متوجه شدید خونریزی او بیش از حد سنگین است (خیس شدن پد در کمتر از یک ساعت)، بیش از ۷ روز طول کشیده، یا علائم هشداردهنده‌ای مثل غش کردن، رنگ‌پریدگی شدید یا تنگی نفس دارد، او را به مراجعه فوری به پزشک یا اورژانس تشویق کنید و در صورت نیاز همراهی‌اش کنید.</p>
    </GuideSection>

    <p class="text-xs text-slate-400 dark:text-slate-500">
      منابع: Mayo Clinic، ACOG (کالج آمریکایی متخصصان زنان و زایمان)، MSD Manuals و CDC. این صفحه صرفاً اطلاعات عمومی سلامت ارائه می‌دهد و جایگزین تشخیص یا مشاوره پزشکی نیست.
    </p>
  </div>
</template>
