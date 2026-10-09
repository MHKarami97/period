import { CardIntensity, CardType, TruthOrDareCardFactory, type TruthOrDareCard } from "./TruthOrDareCard";

function card(id: string, type: CardType, intensity: CardIntensity, text: string): TruthOrDareCard {
  return TruthOrDareCardFactory.create({ id, type, intensity, text });
}

/**
 * Built-in cards. Placeholders: {player} = whoever draws, {partner} = the other person.
 * Content is consent-based; the UI always lets a player skip a card.
 */
export const DEFAULT_CARDS: readonly TruthOrDareCard[] = [
  card("default-truth-soft-1", CardType.Truth, CardIntensity.Soft, "اولین چیزی که در {partner} توجهت را جلب کرد چه بود؟"),
  card("default-truth-soft-2", CardType.Truth, CardIntensity.Soft, "کدام لحظه‌ی عاشقانه‌ی ما را هیچ‌وقت فراموش نمی‌کنی؟"),
  card("default-truth-soft-3", CardType.Truth, CardIntensity.Soft, "کدام ظاهر {partner} را بیشتر از همه دوست داری؟"),
  card("default-truth-soft-4", CardType.Truth, CardIntensity.Soft, "کدام نوع بوسه را بیشتر دوست داری؟"),
  card("default-truth-soft-5", CardType.Truth, CardIntensity.Soft, "چه چیزی درباره‌ی {partner} دلت را قلقلک می‌دهد؟"),
  card("default-truth-soft-6", CardType.Truth, CardIntensity.Soft, "کدام قسمت صورت یا بدن {partner} را بیشتر از بقیه دوست داری؟"),
  card("default-truth-medium-1", CardType.Truth, CardIntensity.Medium, "داغ‌ترین لحظه‌ی مشترک ما برایت کدام بود؟"),
  card("default-truth-medium-2", CardType.Truth, CardIntensity.Medium, "چه لمسی از طرف {partner} تو را بیشتر از همه روشن می‌کند؟"),
  card("default-truth-medium-3", CardType.Truth, CardIntensity.Medium, "چه ساعتی از روز بیشتر حال صمیمیت داری؟"),
  card("default-truth-medium-4", CardType.Truth, CardIntensity.Medium, "چه کاری را دوست داری {partner} بیشتر انجام دهد؟"),
  card("default-truth-medium-5", CardType.Truth, CardIntensity.Medium, "درباره‌ی {partner} تا حالا خیال‌پردازی ماجراجویانه داشته‌ای؟ کوتاه تعریف کن."),
  card("default-truth-medium-6", CardType.Truth, CardIntensity.Medium, "کدام لباس (یا بی‌لباسی) {partner} برایت وسوسه‌انگیزتر است؟"),
  card("default-truth-bold-1", CardType.Truth, CardIntensity.Bold, "یک فانتزی که هنوز به {partner} نگفته‌ای را خلاصه بگو (فقط اگر راحتی)."),
  card("default-truth-bold-2", CardType.Truth, CardIntensity.Bold, "چه چیزی را دوست داری {partner} با تو امتحان کند؟"),
  card("default-truth-bold-3", CardType.Truth, CardIntensity.Bold, "کدام حالت یا حرکت را بیشتر از همه دوست داری؟"),
  card("default-truth-bold-4", CardType.Truth, CardIntensity.Bold, "اگر امشب یک دقیقه کنترل کامل با تو بود، چه می‌کردی؟"),
  card("default-truth-bold-5", CardType.Truth, CardIntensity.Bold, "چه حرفی در لحظه‌ی صمیمیت بیشتر از همه تو را تحریک می‌کند؟"),
  card("default-truth-bold-6", CardType.Truth, CardIntensity.Bold, "چه چیز تازه‌ای می‌خواهی با {partner} امتحان کنی؟"),
  card("default-dare-soft-1", CardType.Dare, CardIntensity.Soft, "{partner} را ۱۰ ثانیه محکم بغل کن."),
  card("default-dare-soft-2", CardType.Dare, CardIntensity.Soft, "یک جمله‌ی عاشقانه در گوش {partner} زمزمه کن."),
  card("default-dare-soft-3", CardType.Dare, CardIntensity.Soft, "دست {partner} را ببوس."),
  card("default-dare-soft-4", CardType.Dare, CardIntensity.Soft, "۳۰ ثانیه برای {partner} ژست جذاب بگیر."),
  card("default-dare-soft-5", CardType.Dare, CardIntensity.Soft, "پشت گردن {partner} را آرام ببوس."),
  card("default-dare-soft-6", CardType.Dare, CardIntensity.Soft, "یک تعریف بلند و صمیمانه از ظاهر {partner} بگو."),
  card("default-dare-medium-1", CardType.Dare, CardIntensity.Medium, "۱ دقیقه ماساژ شانه به {partner} بده."),
  card("default-dare-medium-2", CardType.Dare, CardIntensity.Medium, "یک بوسه‌ی ۲۰ ثانیه‌ای روی لب‌های {partner} بده."),
  card("default-dare-medium-3", CardType.Dare, CardIntensity.Medium, "یک تکه از لباس {partner} را آرام دربیاور."),
  card("default-dare-medium-4", CardType.Dare, CardIntensity.Medium, "با لب‌هایت مسیری از گوش تا گردن {partner} را دنبال کن."),
  card("default-dare-medium-5", CardType.Dare, CardIntensity.Medium, "یک رقص آهسته و نزدیک با {partner} انجام بده."),
  card("default-dare-medium-6", CardType.Dare, CardIntensity.Medium, "چشم‌های {partner} را ببند و با یک بوسه غافلگیرش کن."),
  card("default-dare-bold-1", CardType.Dare, CardIntensity.Bold, "لباس بالاتنه‌ی {partner} را دربیاور و او را ببوس."),
  card("default-dare-bold-2", CardType.Dare, CardIntensity.Bold, "یک تکه یخ را آرام روی گردن و شانه‌ی {partner} بکش."),
  card("default-dare-bold-3", CardType.Dare, CardIntensity.Bold, "۲ دقیقه هر جای بدن {partner} که او بگوید را ببوس."),
  card("default-dare-bold-4", CardType.Dare, CardIntensity.Bold, "یکی از لباس‌هایت را آهسته و با ناز برای {partner} دربیاور."),
  card("default-dare-bold-5", CardType.Dare, CardIntensity.Bold, "فانتزی‌ات را ۳۰ ثانیه برای {partner} اجرا کن (اگر راحتی)."),
  card("default-dare-bold-6", CardType.Dare, CardIntensity.Bold, "۱ دقیقه هر جا که {partner} می‌خواهد دست‌هایت را ببر و نوازشش کن."),
];
