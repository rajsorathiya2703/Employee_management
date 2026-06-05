import { Prisma } from "@prisma/client";
export declare const createEmployee: (payload: Prisma.EmployeeCreateInput) => Promise<{
    id: number;
    createdAt: Date;
    updatedAt: Date;
    name: string;
    email: string;
    password: string;
    phone: string | null;
    otpCode: string | null;
    otpExpiry: Date | null;
    refreshToken: string | null;
}>;
export declare const getEmployees: () => Promise<{
    id: number;
    createdAt: Date;
    updatedAt: Date;
    name: string;
    email: string;
    password: string;
    phone: string | null;
    otpCode: string | null;
    otpExpiry: Date | null;
    refreshToken: string | null;
}[]>;
