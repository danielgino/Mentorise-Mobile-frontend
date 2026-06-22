/**
 * useForm Hook
 * Centralized form state management with validation
 * Handles: form data, field errors, loading/error states
 */

import { useState, useCallback, useMemo } from "react";

export interface UseFormOptions<T> {
    initialValues: T;
    onSubmit: (values: T) => Promise<void> | void;
    validate?: (values: T) => Partial<Record<keyof T, string>>;
}

export interface UseFormReturn<T> {
    values: T;
    errors: Partial<Record<keyof T, string>>;
    loading: boolean;
    error: string | null;

    // Field handlers
    setFieldValue: (field: keyof T, value: any) => void;
    setFieldError: (field: keyof T, error: string) => void;
    resetField: (field: keyof T) => void;

    // Form handlers
    handleChange: (field: keyof T) => (value: any) => void;
    handleBlur: (field: keyof T) => () => void;
    handleSubmit: () => Promise<void>;
    reset: () => void;

    // State checks
    isValid: boolean;
    isDirty: boolean;
    hasErrors: boolean;
}

/**
 * Custom hook for managing form state and validation
 *
 * @example
 * const form = useForm({
 *   initialValues: { email: "", password: "" },
 *   validate: (values) => {
 *     const errors: any = {};
 *     if (!values.email) errors.email = "Email required";
 *     return errors;
 *   },
 *   onSubmit: async (values) => {
 *     await loginApi(values);
 *   }
 * });
 *
 * return (
 *   <TextInput value={form.values.email} onChangeText={form.handleChange('email')} />
 * );
 */
export function useForm<T extends Record<string, any>>({
    initialValues,
    onSubmit,
    validate,
}: UseFormOptions<T>): UseFormReturn<T> {
    const [values, setValues] = useState<T>(initialValues);
    const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});

    // ---- Field handlers ----

    const setFieldValue = useCallback((field: keyof T, value: any) => {
        setValues((prev) => ({ ...prev, [field]: value }));
    }, []);

    const setFieldError = useCallback((field: keyof T, fieldError: string) => {
        setErrors((prev) => ({ ...prev, [field]: fieldError }));
    }, []);

    const resetField = useCallback((field: keyof T) => {
        setValues((prev) => ({ ...prev, [field]: initialValues[field] }));
        setErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors[field];
            return newErrors;
        });
        setTouched((prev) => {
            const newTouched = { ...prev };
            delete newTouched[field];
            return newTouched;
        });
    }, [initialValues]);

    // ---- Change/Blur handlers ----

    const handleChange = useCallback(
        (field: keyof T) => (value: any) => {
            setFieldValue(field, value);
            // Clear error on change
            if (errors[field]) {
                setFieldError(field, "");
            }
        },
        [setFieldValue, setFieldError, errors]
    );

    const handleBlur = useCallback(
        (field: keyof T) => () => {
            setTouched((prev) => ({ ...prev, [field]: true }));

            // Validate on blur if validator provided
            if (validate) {
                const fieldErrors = validate(values);
                if (fieldErrors[field]) {
                    setFieldError(field, fieldErrors[field]);
                }
            }
        },
        [values, validate, setFieldError]
    );

    // ---- Submit handler ----

    const handleSubmit = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            // Validate all fields
            if (validate) {
                const newErrors = validate(values);
                setErrors(newErrors);

                if (Object.keys(newErrors).length > 0) {
                    return;
                }
            }

            // Call onSubmit
            await onSubmit(values);
        } catch (err: any) {
            setError(err?.message ?? "An error occurred");
        } finally {
            setLoading(false);
        }
    }, [values, validate, onSubmit]);

    // ---- Reset handler ----

    const reset = useCallback(() => {
        setValues(initialValues);
        setErrors({});
        setTouched({});
        setError(null);
    }, [initialValues]);

    // ---- Computed states ----

    const isValid = useMemo(() => Object.keys(errors).length === 0, [errors]);

    const isDirty = useMemo(() => {
        return JSON.stringify(values) !== JSON.stringify(initialValues);
    }, [values, initialValues]);

    const hasErrors = useMemo(() => Object.keys(errors).length > 0, [errors]);

    return {
        values,
        errors,
        loading,
        error,

        setFieldValue,
        setFieldError,
        resetField,

        handleChange,
        handleBlur,
        handleSubmit,
        reset,

        isValid,
        isDirty,
        hasErrors,
    };
}

