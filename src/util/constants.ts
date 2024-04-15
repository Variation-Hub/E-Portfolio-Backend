export enum UserRole {
    Learner = 'Learner',
    Trainer = 'Trainer',
    Employer = 'Employer',
    IQA = 'IQA',
    LIQA = 'LIQA',
    EQA = 'EQA',
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