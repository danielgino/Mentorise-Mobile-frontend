export type TutorProfile = {
    id: number;
    fullName: string;
    profileImageUrl:string|null
    majorName: string;
    years: number[];
    courses: string[];
    alumni: boolean;
    bio: string | null;
    tutorImageUrl: string | null;
    ratingAvg: number | null;
    totalReviews: number;
    hourlyRate: number | null;
    createdAt: string;
};
