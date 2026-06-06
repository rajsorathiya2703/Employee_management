import { AdvanceSalaryStatus, Prisma } from "@prisma/client";
export interface CreateAdvancePayload {
    employeeId: number;
    salaryMonth: string;
    amount: number;
    remark: string;
}
export interface GetAdvanceQuery {
    employeeId: number;
    pageIndex?: number | string;
    pageSize?: number | string;
    status?: AdvanceSalaryStatus;
}
export declare const createAdvanceRequest: (payload: CreateAdvancePayload) => Promise<{
    id: number;
    status: import(".prisma/client").$Enums.AdvanceSalaryStatus;
    createdAt: Date;
    updatedAt: Date;
    employeeId: number;
    amount: Prisma.Decimal;
    salaryMonth: string;
    remark: string;
    declinedReason: string | null;
    resolvedAt: Date | null;
}>;
export declare const getAdvanceRequests: (query: GetAdvanceQuery) => Promise<{
    data: {
        id: number;
        status: import(".prisma/client").$Enums.AdvanceSalaryStatus;
        createdAt: Date;
        updatedAt: Date;
        employeeId: number;
        amount: Prisma.Decimal;
        salaryMonth: string;
        remark: string;
        declinedReason: string | null;
        resolvedAt: Date | null;
    }[];
    pagination: {
        total: number;
        pageIndex: number;
        pageSize: number;
    };
}>;
export declare const getAdvanceRequestById: (id: number) => Promise<{
    id: number;
    status: import(".prisma/client").$Enums.AdvanceSalaryStatus;
    createdAt: Date;
    updatedAt: Date;
    employeeId: number;
    amount: Prisma.Decimal;
    salaryMonth: string;
    remark: string;
    declinedReason: string | null;
    resolvedAt: Date | null;
} | null>;
export declare const deleteAdvanceRequest: (id: number) => Promise<{
    id: number;
    status: import(".prisma/client").$Enums.AdvanceSalaryStatus;
    createdAt: Date;
    updatedAt: Date;
    employeeId: number;
    amount: Prisma.Decimal;
    salaryMonth: string;
    remark: string;
    declinedReason: string | null;
    resolvedAt: Date | null;
}>;
