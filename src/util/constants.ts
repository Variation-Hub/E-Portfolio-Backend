export enum UserRole {
    Learner = 'Learner',
    EQA = 'EQA',
    IQA = 'IQA',
    LIQA = 'LIQA',
    Employer = 'Employer',
    Trainer = 'Trainer',
    Admin = 'Admin',
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

export const SocketDomain = {
    Notification: "notification",
    Message: "message",
    CourseAllocation: "Course Allocation",
    MessageSend: "Message Send",
    MessageUpdate: "Message Update",
    MessageDelete: "Message Delete",
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
