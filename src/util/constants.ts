export enum UserRole {
    Learner = 'Learner',
    EQA = 'EQA',
    IQA = 'IQA',
    LIQA = 'LIQA',
    Employer = 'Employer',
    Trainer = 'Trainer',
    Admin = 'Admin',
}

export enum Gender {
    Male = 'Male',
    Female = 'Female',
    NonBinary = 'Non-Binary',
    Other = 'Other'
}

export enum AssessmentMethod {
    WO = 'WO',
    WP = 'WP',
    PW = 'PW',
    VI = 'VI',
    LB = 'LB',
    PD = 'PD',
    PT = 'PT',
    TE = 'TE',
    RJ = 'RJ',
    OT = 'OT',
    RPL = 'RPL',
}
export enum AssessmentStatus {
    Fully = "Fully Complete",
    Partially = "Partially Complete",
    NotStarted = "Not Started",
}

export const ChatEventEnum = {
    CONNECTED_EVENT: "connected",
    DISCONNECT_EVENT: "disconnect",
    NOTIFICATION: "notification",
};

export enum UserStatus {
    Active = "Active",
    InActive = "InActive"
}

export enum NotificationType {
    Notification = "notification",
    News = "news",
    Allocation = "allocation"
}

export enum TimeLogActivityType {
    VirtualTrainingSession = "Virtual Training Session",
    TraditionalFace_to_facesession = "Traditional face-to-face session",
    Trainerorassessorledtraining = "Trainer or assessor led training",
    Electronicordistancelearningorself_study = "Electronic or distance learning, or self-study",
    Coachingormentoring = "Coaching or mentoring",
    Guidedlearningwithnotrainer_assessorpresent = "Guided learning with no trainer/assessor present",
    Gainingtechnicalexperiencebydoingmyjob = "Gaining technical experience by doing my job",
    Review_feedback_support = "Review/feedback/support",
    Assessmentorexamination = "Assessment or examination",
    Other = "Other",
    Furloughed = "Furloughed"
}

export enum TimeLogType {
    NotApplicable = "Not Applicable",
    OnTheJob = "On the job",
    OffTheJob = "Off the job"
}

export const SocketDomain = {
    Notification: "notification",
    Message: "message",
    CourseAllocation: "Course Allocation",
    MessageSend: "Message Send",
    MessageUpdate: "Message Update",
    MessageDelete: "Message Delete",
    SessionCreate: "Session Create",
    InnovationChat: "Innovation Chat",
}

export const rolePriority = [
    UserRole.Admin,
    UserRole.Trainer,
    UserRole.Employer,
    UserRole.LIQA,
    UserRole.IQA,
    UserRole.EQA,
    UserRole.Learner
];

export function getHighestPriorityRole(roles: UserRole[]): UserRole | null {
    for (const role of rolePriority) {
        if (roles.includes(role)) {
            return role;
        }
    }
    return null;
}
