import { ScratchCardFactory, ScratchCategory, type ScratchCard } from "./ScratchCard";

function card(id: string, category: ScratchCategory, text: string): ScratchCard {
  return ScratchCardFactory.create({ id, category, text });
}

export const DEFAULT_SCRATCH_CARDS: readonly ScratchCard[] = [
  card("default-scratch-outing-1", ScratchCategory.Outing, "یک شام دونفره در رستورانی که تا حالا نرفته‌اید."),
  card("default-scratch-outing-2", ScratchCategory.Outing, "پیاده‌روی غروب و خوردن بستنی یا چای کنار هم."),
  card("default-scratch-outing-3", ScratchCategory.Outing, "یک سینما یا تئاتر؛ طرف مقابل نمایش را انتخاب می‌کند."),
  card("default-scratch-outing-4", ScratchCategory.Outing, "رفتن به یک کافه‌ی جدید و یک دست بازی کارتی دونفره."),
  card("default-scratch-outing-5", ScratchCategory.Outing, "پیک‌نیک کوچک در نزدیک‌ترین پارک."),
  card("default-scratch-outing-6", ScratchCategory.Outing, "گشتن در یک بازار یا گالری و انتخاب یک هدیه‌ی کوچک برای هم."),
  card("default-scratch-outing-7", ScratchCategory.Outing, "تماشای غروب یا طلوع آفتاب از یک جای بلند."),
  card("default-scratch-outing-8", ScratchCategory.Outing, "شب‌گردی با ماشین و یک لیست آهنگ مشترک."),
  card("default-scratch-adventure-1", ScratchCategory.Adventure, "امتحان یک غذای کاملاً جدید با هم؛ از سبکی که تا حالا نخورده‌اید."),
  card("default-scratch-adventure-2", ScratchCategory.Adventure, "یک کوهنوردی یا پیاده‌روی سبک در طبیعت."),
  card("default-scratch-adventure-3", ScratchCategory.Adventure, "یک کلاس یا کارگاه یک‌روزه (آشپزی، سفالگری، رقص)."),
  card("default-scratch-adventure-4", ScratchCategory.Adventure, "سفر یک‌روزه‌ی بی‌برنامه به شهر یا روستای نزدیک."),
  card("default-scratch-adventure-5", ScratchCategory.Adventure, "اتاق فرار یا بازی گروهی مناسب دو نفر."),
  card("default-scratch-adventure-6", ScratchCategory.Adventure, "رانندگی بدون مقصد؛ در هر چهارراه نفر مقابل جهت را انتخاب می‌کند."),
  card("default-scratch-adventure-7", ScratchCategory.Adventure, "۳۰ دقیقه عکاسی از هم و از جاهای جالب."),
  card("default-scratch-adventure-8", ScratchCategory.Adventure, "یک ورزش یا فعالیت تازه (دوچرخه، قایق، اسکیت)."),
  card("default-scratch-athome-1", ScratchCategory.AtHome, "شام شمع‌دار در خانه با منوی دلخواه خودتان."),
  card("default-scratch-athome-2", ScratchCategory.AtHome, "یک شب فیلم با پتو و تنقلات؛ فیلم را قرعه بکشید."),
  card("default-scratch-athome-3", ScratchCategory.AtHome, "رقص آرام در پذیرایی با آهنگ مورد علاقه‌تان."),
  card("default-scratch-athome-4", ScratchCategory.AtHome, "پختن یک دسر با هم."),
  card("default-scratch-athome-5", ScratchCategory.AtHome, "یک شب بدون موبایل؛ فقط شما و گفت‌وگو."),
  card("default-scratch-athome-6", ScratchCategory.AtHome, "ماساژ متقابل ۱۰ دقیقه‌ای با روغن یا کرم."),
  card("default-scratch-athome-7", ScratchCategory.AtHome, "نوشتن یک نامه‌ی عاشقانه‌ی کوتاه برای هم و خواندن آن."),
  card("default-scratch-athome-8", ScratchCategory.AtHome, "ساختن یک گوشه‌ی دنج با بالش و نور کم و کتاب‌خواندن با هم."),
  card("default-scratch-intimate-1", ScratchCategory.Intimate, "یک ساعت وقت مخصوص صمیمیت؛ بدون عجله و بدون برنامه‌ی دیگر."),
  card("default-scratch-intimate-2", ScratchCategory.Intimate, "دوش یا حمام مشترک با موسیقی آرام."),
  card("default-scratch-intimate-3", ScratchCategory.Intimate, "امشب «بازی دو سؤالی» یا «تاس دوتایی» را بازی کنید."),
  card("default-scratch-intimate-4", ScratchCategory.Intimate, "هر کدام یک خیال (در حد راحتی) روی کاغذ بنویسد و با هم بخوانید."),
  card("default-scratch-intimate-5", ScratchCategory.Intimate, "چیدن اتاق خواب با شمع و رایحه‌ی دلخواه."),
  card("default-scratch-intimate-6", ScratchCategory.Intimate, "امشب فقط نوازش؛ هدف لذت‌بردن از لمس است، نه رسیدن به جایی."),
  card("default-scratch-intimate-7", ScratchCategory.Intimate, "یک لباس یا حال‌وهوایی که دیگری دوست دارد."),
  card("default-scratch-intimate-8", ScratchCategory.Intimate, "یک تغییر کوچک: جای همیشگی را عوض کنید."),
];
