export type ScopeType = 'COURSE' | 'YEAR' | 'MAJOR';
export type ApplicationType = 'INITIAL' | 'UPDATE';

export interface TutorApplicationScopeCreate {
    scopeType: ScopeType;
    courseId?: number;
    yearNumber?: number;
}

export interface TutorApplicationCreateRequest {
    requestText?: string;
    transcriptUrl?: string;
    scopes: TutorApplicationScopeCreate[];
}

export interface TutorScopeDto {
    scopeType: ScopeType;
    courseId?: number;
    courseName?: string;
    yearNumber?: number;
}

export interface TutorApplicationStatusResponse {
    hasPending: boolean;
    applicationId?: number;
    applicationType?: ApplicationType;
    status?: 'PENDING';
    createdAt?: string;
    scopes?: TutorScopeDto[];
    lastRejected?: boolean;
}
