import React, { createContext, useContext, useMemo, useState } from "react";

export type RegisterDraft = {
    nationalId: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phoneNumber: string;
    majorId: number | null;
    isAlumni: boolean | null;
};

type RegisterContextValue = {
    draft: RegisterDraft;
    setDraft: React.Dispatch<React.SetStateAction<RegisterDraft>>;
    resetDraft: () => void;
};

const RegisterContext = createContext<RegisterContextValue | null>(null);

const initialDraft: RegisterDraft = {
    nationalId: "",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phoneNumber: "",
    majorId: null,
    isAlumni: null,
};

export function RegisterProvider({ children }: { children: React.ReactNode }) {
    const [draft, setDraft] = useState<RegisterDraft>(initialDraft);

    const value = useMemo(
        () => ({
            draft,
            setDraft,
            resetDraft: () => setDraft(initialDraft),
        }),
        [draft]
    );

    return <RegisterContext.Provider value={value}>{children}</RegisterContext.Provider>;
}

export function useRegisterDraft() {
    const ctx = useContext(RegisterContext);
    if (!ctx) throw new Error("useRegisterDraft must be used within RegisterProvider");
    return ctx;
}
