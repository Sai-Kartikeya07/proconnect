export interface IUser {
    userId: string;
    userImage: string;
    firstName: string;
    lastName?: string;
    // Optional email (not always present in existing calls) used for notifications
    email?: string;
}