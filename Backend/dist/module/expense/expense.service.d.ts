import { ExpenseStatus, ExpenseType, Prisma } from "@prisma/client";
export interface CreateExpensePayload {
    employeeId: number;
    title: string;
    date: string;
    siteName: string;
    amount: number;
    category: string;
    expenseType?: ExpenseType;
    unit?: string;
    unitRate?: number;
    multiLevelApproval?: string;
}
export interface UpdateExpensePayload {
    title?: string;
    date?: string;
    siteName?: string;
    amount?: number;
    category?: string;
    expenseType?: ExpenseType;
    unit?: string;
    unitRate?: number;
    multiLevelApproval?: string;
}
export interface GetExpensesQuery {
    employeeId: number;
    pageIndex?: number | string;
    pageSize?: number | string;
    status?: ExpenseStatus;
    month?: number | string;
    year?: number | string;
}
export declare const createExpense: (payload: CreateExpensePayload) => Promise<{
    id: number;
    status: import(".prisma/client").$Enums.ExpenseStatus;
    createdAt: Date;
    updatedAt: Date;
    employeeId: number;
    date: Date;
    expenseCode: string;
    title: string;
    siteName: string;
    amount: Prisma.Decimal;
    category: string;
    expenseType: import(".prisma/client").$Enums.ExpenseType;
    unit: string | null;
    unitRate: Prisma.Decimal | null;
    multiLevelApproval: string | null;
}>;
export declare const getExpenses: (query: GetExpensesQuery) => Promise<{
    data: {
        id: number;
        status: import(".prisma/client").$Enums.ExpenseStatus;
        createdAt: Date;
        updatedAt: Date;
        employeeId: number;
        date: Date;
        expenseCode: string;
        title: string;
        siteName: string;
        amount: Prisma.Decimal;
        category: string;
        expenseType: import(".prisma/client").$Enums.ExpenseType;
        unit: string | null;
        unitRate: Prisma.Decimal | null;
        multiLevelApproval: string | null;
    }[];
    pagination: {
        total: number;
        pageIndex: number;
        pageSize: number;
    };
    totalAmount: number;
}>;
export declare const getExpenseById: (id: number) => Promise<{
    id: number;
    status: import(".prisma/client").$Enums.ExpenseStatus;
    createdAt: Date;
    updatedAt: Date;
    employeeId: number;
    date: Date;
    expenseCode: string;
    title: string;
    siteName: string;
    amount: Prisma.Decimal;
    category: string;
    expenseType: import(".prisma/client").$Enums.ExpenseType;
    unit: string | null;
    unitRate: Prisma.Decimal | null;
    multiLevelApproval: string | null;
} | null>;
export declare const updateExpense: (id: number, payload: UpdateExpensePayload) => Promise<{
    id: number;
    status: import(".prisma/client").$Enums.ExpenseStatus;
    createdAt: Date;
    updatedAt: Date;
    employeeId: number;
    date: Date;
    expenseCode: string;
    title: string;
    siteName: string;
    amount: Prisma.Decimal;
    category: string;
    expenseType: import(".prisma/client").$Enums.ExpenseType;
    unit: string | null;
    unitRate: Prisma.Decimal | null;
    multiLevelApproval: string | null;
}>;
export declare const deleteExpense: (id: number) => Promise<{
    id: number;
    status: import(".prisma/client").$Enums.ExpenseStatus;
    createdAt: Date;
    updatedAt: Date;
    employeeId: number;
    date: Date;
    expenseCode: string;
    title: string;
    siteName: string;
    amount: Prisma.Decimal;
    category: string;
    expenseType: import(".prisma/client").$Enums.ExpenseType;
    unit: string | null;
    unitRate: Prisma.Decimal | null;
    multiLevelApproval: string | null;
}>;
