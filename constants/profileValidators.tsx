import {normalize, RX} from "@/constants/registerValidators";

export type ProfileForm = {
    fullName: string;
    email: string;
    phone: string;
};

export type ProfileField = keyof ProfileForm;

export function validateProfileField(field: ProfileField, value: string) {
    switch (field) {
        case "fullName": {
            const v = normalize.name(value);
            return RX.hebrewNameWithSpaces.test(v) ? undefined : "שם מלא בעברית (אפשר גרש), לפחות 2 אותיות בכל מילה";
        }
        case "email": {
            const v = normalize.email(value);
            return RX.email.test(v) ? undefined : "אימייל לא תקין";
        }
        case "phone": {
            const v = normalize.phone(value);
            return RX.phoneIL.test(v) ? undefined : "מספר טלפון ישראלי לא תקין";
        }
        default:
            return undefined;
    }
}

export const transformProfile: Record<ProfileField, (v: string) => string> = {
    fullName: normalize.name,
    email: normalize.email,
    phone: normalize.phone,
};
