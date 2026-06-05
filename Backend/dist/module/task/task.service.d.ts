import { Prisma } from "@prisma/client";
interface TaskQuery {
    search?: string;
    status?: string;
    priority?: string;
    page?: number | string;
    limit?: number | string;
}
export declare const createTask: (payload: Prisma.TaskCreateInput) => Promise<{
    id: string;
    taskName: string;
    description: string;
    priority: import(".prisma/client").$Enums.TaskPriority;
    status: import(".prisma/client").$Enums.TaskStatus;
    dueDate: Date | null;
    createdAt: Date;
    updatedAt: Date;
}>;
export declare const getAllTasks: (query: TaskQuery) => Promise<{
    meta: {
        page: number;
        limit: number;
        total: number;
    };
    data: {
        id: string;
        taskName: string;
        description: string;
        priority: import(".prisma/client").$Enums.TaskPriority;
        status: import(".prisma/client").$Enums.TaskStatus;
        dueDate: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }[];
}>;
export declare const getSingleTask: (id: string) => Promise<{
    id: string;
    taskName: string;
    description: string;
    priority: import(".prisma/client").$Enums.TaskPriority;
    status: import(".prisma/client").$Enums.TaskStatus;
    dueDate: Date | null;
    createdAt: Date;
    updatedAt: Date;
} | null>;
export declare const updateTask: (id: string, payload: Prisma.TaskUpdateInput) => Promise<{
    id: string;
    taskName: string;
    description: string;
    priority: import(".prisma/client").$Enums.TaskPriority;
    status: import(".prisma/client").$Enums.TaskStatus;
    dueDate: Date | null;
    createdAt: Date;
    updatedAt: Date;
}>;
export declare const completeTask: (id: string) => Promise<{
    id: string;
    taskName: string;
    description: string;
    priority: import(".prisma/client").$Enums.TaskPriority;
    status: import(".prisma/client").$Enums.TaskStatus;
    dueDate: Date | null;
    createdAt: Date;
    updatedAt: Date;
}>;
export declare const deleteTask: (id: string) => Promise<{
    id: string;
    taskName: string;
    description: string;
    priority: import(".prisma/client").$Enums.TaskPriority;
    status: import(".prisma/client").$Enums.TaskStatus;
    dueDate: Date | null;
    createdAt: Date;
    updatedAt: Date;
}>;
export declare const restoreTask: (id: string) => Promise<{
    id: string;
    taskName: string;
    description: string;
    priority: import(".prisma/client").$Enums.TaskPriority;
    status: import(".prisma/client").$Enums.TaskStatus;
    dueDate: Date | null;
    createdAt: Date;
    updatedAt: Date;
}>;
export declare const dashboardSummary: () => Promise<{
    importantTask: number;
    todayDueTask: number;
    totalPending: number;
    completedTask: number;
}>;
export {};
