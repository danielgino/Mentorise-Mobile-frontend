import {
    AlertCircle,
    Bell,
    CheckCircle,
    FileText,
    Info,
    Sparkles,
    UserCheck,
    XCircle,
} from "lucide-react-native";

export function getNotificationUi(type: string) {
    switch (type) {
        case "APPLICATION_APPROVED":
        case "APPROVED":
            return {
                icon: CheckCircle,
                iconColor: "#40E0D0",
                ctaText: "לצפייה",
            };

        case "APPLICATION_REJECTED":
        case "REJECTED":
            return {
                icon: XCircle,
                iconColor: "#FF6B6B",
                ctaText: "לפרטים",
            };

        case "ADMIN_ANNOUNCEMENT":
        case "ADMIN_MESSAGE":
            return {
                icon: AlertCircle,
                iconColor: "#2E86DE",
                ctaText: "לפרטים",
            };

        case "ACCOUNT_VERIFIED":
        case "VERIFIED":
            return {
                icon: UserCheck,
                iconColor: "#A66CFF",
            };

        case "APP_UPDATE":
        case "UPDATE":
            return {
                icon: Sparkles,
                iconColor: "#40E0D0",
                ctaText: "לעדכון",
            };

        case "NEW_ASSIGNMENT":
        case "REMINDER":
            return {
                icon: FileText,
                iconColor: "#A66CFF",
                ctaText: "לצפייה",
            };

        case "INFO":
        case "PROFILE_INCOMPLETE":
            return {
                icon: Info,
                iconColor: "#2E86DE",
            };

        default:
            return {
                icon: Bell,
                iconColor: "#40E0D0",
            };
    }
}