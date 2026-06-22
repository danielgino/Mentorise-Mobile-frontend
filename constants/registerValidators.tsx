// validators/registerValidators.ts
export const RX = {
    // ת"ז: רק ספרות 5–20
    nationalId: /^\d{5,20}$/,

    // שם פרטי/משפחה: עברית + גרש/׳ בלבד, בלי רווחים/מקפים, לפחות 2 תווים
    // חשוב: /u כדי לתמוך ב-Unicode
    hebrewNameWithSpaces: /^(?:[\u0590-\u05FF]{2,}(?:['׳][\u0590-\u05FF]+)*)(?: (?:[\u0590-\u05FF]{2,}(?:['׳][\u0590-\u05FF]+)*))*$/,

    // אימייל: פרקטי (ASCII), כמו בשרת
    email: /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,63}$/,

    // סיסמה: 8–32, אות גדולה/קטנה/ספרה/תו מיוחד
    password: /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&#^()_+\-=]).{8,32}$/,

    // טלפון ישראלי: +972 או 0, עם קבוצות נייד/קווי תקינות
    phoneIL: /^(?:\+972-?|0)(?:[23489]\d{7}|5\d{8})$/,
};

export const normalize = {
    email: (v: string) => (v ?? "").trim().toLowerCase(),
    trim: (v: string) => (v ?? "").trim(),
    name: (v: string) => (v ?? "").trim().replace(/\s+/g, " "),

    // נירמול טלפון: השארת ספרות + פלוס, אופציונלי המרה ל-+972
    phone: (v: string) => (v ?? "").replace(/[^\d+]/g, ""),
};

export type Step1 = {
    nationalId: string; firstName: string; lastName: string;
    email: string; password: string; confirmPassword: string; phoneNumber: string;
};

export function validateStep1(d: Step1) {
    const errors: Partial<Record<keyof Step1, string>> = {};
    const nationalId = normalize.trim(d.nationalId);
    const firstName  = normalize.name(d.firstName);
    const lastName   = normalize.name(d.lastName);
    const email      = normalize.email(d.email);
    const password   = d.password ?? "";
    const confirm    = d.confirmPassword ?? "";
    const phone      = normalize.phone(d.phoneNumber);

    if (!RX.nationalId.test(nationalId)) errors.nationalId = "תעודת זהות לא תקינה";
    if (!RX.hebrewNameWithSpaces.test(firstName))
        errors.firstName = "שם פרטי בעברית (אפשר גרש) עם/בלי רווחים; לפחות 2 אותיות בכל מילה";
    if (!RX.hebrewNameWithSpaces.test(lastName))
        errors.lastName = "שם משפחה בעברית (אפשר גרש) עם/בלי רווחים; לפחות 2 אותיות בכל מילה";
    if (!RX.email.test(email)) errors.email = "אימייל לא תקין";
    if (!RX.password.test(password)) errors.password = "סיסמה חייבת להיות באנגליץ להכיל לפחות תו אחד גדול מספר ותו מיוחד ";
    if (password !== confirm) errors.confirmPassword = "הסיסמאות אינן תואמות";
    if (!RX.phoneIL.test(phone)) errors.phoneNumber = "מספר טלפון ישראלי לא תקין";

    return { errors, values: { nationalId, firstName, lastName, email, password, phoneNumber: phone } };
}

export type Step2 = { majorId: number | null };
export function validateStep2(d: Step2) {
    const errors: Partial<Record<keyof Step2, string>> = {};
    if (d.majorId == null) errors.majorId = "יש לבחור מסלול";
    return { errors };
}

export type Step3 = { studyStatus: "student" | "graduate" | "" };
export function validateStep3(d: Step3) {
    const errors: Partial<Record<keyof Step3, string>> = {};
    if (!d.studyStatus) errors.studyStatus = "יש לבחור סטטוס לימודי";
    return { errors };
}
export type Step1Field = keyof Step1;

export function validateField(field: Step1Field, value: string, draft: Step1): string | undefined {
    switch (field) {
        case "nationalId": {
            const v = normalize.trim(value);
            return RX.nationalId.test(v) ? undefined : "תעודת זהות לא תקינה";
        }
        case "firstName": {
            const v = normalize.name(value);
            return RX.hebrewNameWithSpaces.test(v)
                ? undefined
                : "שם פרטי בעברית (אפשר גרש) עם/בלי רווחים; לפחות 2 אותיות בכל מילה";
        }
        case "lastName": {
            const v = normalize.name(value);
            return RX.hebrewNameWithSpaces.test(v)
                ? undefined
                : "שם משפחה בעברית (אפשר גרש) עם/בלי רווחים; לפחות 2 אותיות בכל מילה";
        }
        case "email": {
            const v = normalize.email(value);
            return RX.email.test(v) ? undefined : "אימייל לא תקין";
        }
        case "password": {
            return RX.password.test(value) ? undefined : "סיסמה לא עומדת בכללים";
        }
        case "confirmPassword": {
            return value === (draft.password ?? "") ? undefined : "הסיסמאות אינן תואמות";
        }
        case "phoneNumber": {
            const v = normalize.phone(value);
            return RX.phoneIL.test(v) ? undefined : "מספר טלפון ישראלי לא תקין";
        }
        default:
            return undefined;
    }
}