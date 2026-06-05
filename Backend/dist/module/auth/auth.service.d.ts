export interface JwtPayload {
    id: number;
    email: string;
    name: string;
}
export declare const signAccessToken: (payload: JwtPayload) => string;
export declare const signRefreshToken: (payload: JwtPayload) => string;
export declare const verifyAccessToken: (token: string) => JwtPayload;
export declare const verifyRefreshToken: (token: string) => JwtPayload;
export declare const sendOtpEmail: (to: string, name: string, otp: string) => Promise<void>;
export interface RegisterPayload {
    name: string;
    email: string;
    password: string;
    phone?: string;
}
export declare const register: (payload: RegisterPayload) => Promise<{
    id: number;
    createdAt: Date;
    name: string;
    email: string;
    phone: string | null;
}>;
export declare const login: (email: string, password: string) => Promise<{
    accessToken: string;
    refreshToken: string;
    employee: {
        id: number;
        name: string;
        email: string;
        phone: string | null;
    };
}>;
export declare const refreshTokens: (token: string) => Promise<{
    accessToken: string;
    refreshToken: string;
}>;
export declare const logout: (employeeId: number) => Promise<void>;
export declare const sendPasswordResetOtp: (email: string) => Promise<void>;
export declare const verifyOtp: (email: string, otp: string) => Promise<boolean>;
export declare const resetPassword: (email: string, otp: string, newPassword: string) => Promise<void>;
