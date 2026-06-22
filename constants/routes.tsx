// constants/routes.ts
export const ROUTES = {
    AUTH: {
        LOGIN: "/login",
        FORGOT_PASSWORD: "/(auth)/forgot-password",
    },

    RESET_PASSWORD: "/reset-password",

    ONBOARDING: {
        REGISTER: "/register",
        LEARNING_TYPE: "/learning-type",
        MAJOR_SELECT: "/major-select",
        ACADEMIC_STATUS: "/academic-status",
        YEAR_SELECT: "/year-select",
        WELCOME_PAGE: "/welcome-page",
        FINDING: "/finding",
    },
    TUTOR_REQUEST: {
        PAGE: "/tutor-apply/tutor",
        CREATE: "/tutor-apply/applyTutorReq",
        VIEW: "/tutor-request/[id]",
    },

    TABS: {
        HOME: "/",
        EXPLORE: "/explore",
        TUTOR: "/tutor-apply",
    },

    MATCH: "/match/match",
    TUTOR_PROFILE: "/tutor/[id]",

    EARNINGS: "/earnings",

} as const;
