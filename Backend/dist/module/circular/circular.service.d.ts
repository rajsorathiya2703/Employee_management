import { Prisma } from "@prisma/client";
interface CircularQuery {
    page?: number | string;
    limit?: number | string;
    search?: string;
    month?: string;
    fromDate?: string;
    toDate?: string;
}
export declare const createCircular: (payload: Prisma.CircularCreateInput) => Promise<{
    id: string;
    createdAt: Date;
    updatedAt: Date;
    circularTitle: string;
    circularDescription: string;
    circularPostDate: Date;
    circularPostTime: string;
}>;
export declare const getAllCirculars: (query: CircularQuery) => Promise<{
    meta: {
        page: number;
        limit: number;
        total: number;
    };
    data: {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        circularTitle: string;
        circularDescription: string;
        circularPostDate: Date;
        circularPostTime: string;
    }[];
}>;
export declare const getCircularById: (id: string) => Promise<{
    id: string;
    createdAt: Date;
    updatedAt: Date;
    circularTitle: string;
    circularDescription: string;
    circularPostDate: Date;
    circularPostTime: string;
} | null>;
export declare const updateCircular: (id: string, payload: Prisma.CircularUpdateInput) => Promise<{
    id: string;
    createdAt: Date;
    updatedAt: Date;
    circularTitle: string;
    circularDescription: string;
    circularPostDate: Date;
    circularPostTime: string;
}>;
export declare const deleteCircular: (id: string) => Promise<{
    id: string;
    createdAt: Date;
    updatedAt: Date;
    circularTitle: string;
    circularDescription: string;
    circularPostDate: Date;
    circularPostTime: string;
}>;
export {};
