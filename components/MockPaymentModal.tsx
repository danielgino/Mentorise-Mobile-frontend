import React from "react";
import { Text, TextInput, View } from "react-native";
import { CreditCard, CalendarDays, Clock3 } from "lucide-react-native";

import type { SessionOfferCardDto } from "@/api/sessionApi";
import { BaseModal } from "@/components/ui/BaseModal";

export type PaymentFormState = {
    cardNumber: string;
    cardHolderName: string;
    expiry: string;
    cvv: string;
};

type MockPaymentModalProps = {
    visible: boolean;
    offer: SessionOfferCardDto | null;
    loading?: boolean;
    form: PaymentFormState;
    onChange: (field: keyof PaymentFormState, value: string) => void;
    onClose: () => void;
    onSubmit: () => void;
    formatDate: (dateString: string) => string;
    formatTime: (dateString: string) => string;
};

export function MockPaymentModal({
    visible,
    offer,
    loading = false,
    form,
    onChange,
    onClose,
    onSubmit,
    formatDate,
    formatTime,
}: MockPaymentModalProps) {
    return (
        <BaseModal
            visible={visible}
            onClose={onClose}
            onSubmit={onSubmit}
            title="תשלום מאובטח"
            submitLabel="אשר ושלם"
            cancelLabel="ביטול"
            loading={loading}
            layout="sheet"
        >
            {/* Offer summary card */}
            <View className="mb-5 overflow-hidden rounded-3xl border border-[rgba(46,134,222,0.15)] bg-[#F0F4FF]">
                <View className="p-4">
                    <View className="mb-3 flex-row-reverse items-center">
                        <View className="ml-3 h-11 w-11 items-center justify-center rounded-2xl bg-[#2E86DE]/10">
                            <CreditCard size={20} color="#2E86DE" />
                        </View>
                        <View className="flex-1">
                            <Text className="text-right text-base font-semibold text-[#1A1A2E]">
                                פרטי השיעור
                            </Text>
                            <Text className="text-right text-sm text-[#9CA3AF]">
                                השלמת תשלום עבור הצעת שיעור
                            </Text>
                        </View>
                    </View>

                    {offer && (
                        <>
                            <Text className="mb-2 text-right text-sm text-[#1A1A2E]">
                                {offer.tutorFullName}
                            </Text>

                            <View className="mb-2 flex-row-reverse items-center">
                                <CalendarDays size={15} color="#9CA3AF" />
                                <Text className="mr-2 text-right text-sm text-[#6B7280]">
                                    {formatDate(offer.startTime)}
                                </Text>
                            </View>

                            <View className="mb-3 flex-row-reverse items-center">
                                <Clock3 size={15} color="#9CA3AF" />
                                <Text className="mr-2 text-right text-sm text-[#6B7280]">
                                    {formatTime(offer.startTime)} - {formatTime(offer.endTime)}
                                </Text>
                            </View>

                            <View className="rounded-2xl border border-[#E5E7EB] bg-white px-4 py-3">
                                <Text className="text-right text-xs text-[#9CA3AF]">
                                    סכום לתשלום
                                </Text>
                                <Text className="mt-1 text-right text-2xl font-bold text-[#2E86DE]">
                                    ₪{offer.price}
                                </Text>
                            </View>
                        </>
                    )}
                </View>
            </View>

            {/* Payment form fields */}
            <View className="gap-3">
                <View>
                    <Text className="mb-2 text-right text-sm text-[#6B7280]">
                        מספר כרטיס
                    </Text>
                    <TextInput
                        value={form.cardNumber}
                        onChangeText={(value) => onChange("cardNumber", value)}
                        placeholder="1234 5678 9012 3456"
                        placeholderTextColor="#9CA3AF"
                        keyboardType="number-pad"
                        maxLength={19}
                        editable={!loading}
                        className="rounded-2xl border border-[#E5E7EB] bg-white px-4 py-4 text-right text-[#1A1A2E]"
                    />
                </View>

                <View>
                    <Text className="mb-2 text-right text-sm text-[#6B7280]">
                        שם בעל הכרטיס
                    </Text>
                    <TextInput
                        value={form.cardHolderName}
                        onChangeText={(value) => onChange("cardHolderName", value)}
                        placeholder="ישראל ישראלי"
                        placeholderTextColor="#9CA3AF"
                        editable={!loading}
                        className="rounded-2xl border border-[#E5E7EB] bg-white px-4 py-4 text-right text-[#1A1A2E]"
                    />
                </View>

                <View className="flex-row-reverse gap-3">
                    <View className="flex-1">
                        <Text className="mb-2 text-right text-sm text-[#6B7280]">
                            תוקף
                        </Text>
                        <TextInput
                            value={form.expiry}
                            onChangeText={(value) => onChange("expiry", value)}
                            placeholder="MM/YY"
                            placeholderTextColor="#9CA3AF"
                            keyboardType="number-pad"
                            maxLength={5}
                            editable={!loading}
                            className="rounded-2xl border border-[#E5E7EB] bg-white px-4 py-4 text-right text-[#1A1A2E]"
                        />
                    </View>

                    <View className="flex-1">
                        <Text className="mb-2 text-right text-sm text-[#6B7280]">
                            CVV
                        </Text>
                        <TextInput
                            value={form.cvv}
                            onChangeText={(value) => onChange("cvv", value)}
                            placeholder="123"
                            placeholderTextColor="#9CA3AF"
                            keyboardType="number-pad"
                            maxLength={4}
                            editable={!loading}
                            secureTextEntry
                            className="rounded-2xl border border-[#E5E7EB] bg-white px-4 py-4 text-right text-[#1A1A2E]"
                        />
                    </View>
                </View>
            </View>
        </BaseModal>
    );
}
