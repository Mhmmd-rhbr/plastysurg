/**
 * Service for managing prompts sent to AI models
 */
export const buildFaceAnalysisPrompt = (preferences, viewType) => {
  return `شما یک دستیار هوش مصنوعی متخصص در جراحی پلاستیک و زیبایی صورت هستید.
با توجه به تصویر ${viewType} ارائه شده، لطفاً موارد زیر را تحلیل کنید:
۱. تقارن صورت
۲. کیفیت پوست و میزان افتادگی
۳. تناسب اجزای صورت (بینی، لب، چانه، چشم‌ها)
۴. پیشنهادات اولیه بر اساس درخواست‌های بیمار: ${preferences || 'ندارد'}

لطفاً پاسخ را به صورت ساختاریافته، حرفه‌ای و به زبان فارسی ارائه دهید.`;
};

export const buildSurgicalPlanPrompt = (analysis, parameters) => {
  return `بر اساس تحلیل چهره زیر:
${analysis}

و پارامترهای مدنظر جراح:
${JSON.stringify(parameters)}

یک پلن جراحی دقیق و گام به گام به زبان فارسی تدوین کنید که شامل ریسک‌ها و ملاحظات پس از عمل باشد.`;
};
