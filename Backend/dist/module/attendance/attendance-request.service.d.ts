import { AttendanceRequestStatus, AttendanceRequestType } from "@prisma/client";
interface CreateAttendanceRequestPayload {
    employeeId: number;
    date: string;
    type: AttendanceRequestType;
    reason: string;
}
interface GetAttendanceRequestsQuery {
    employeeId: number;
    pageIndex?: number | string;
    pageSize?: number | string;
    status?: AttendanceRequestStatus;
}
export declare const createAttendanceRequest: (payload: CreateAttendanceRequestPayload) => Promise<{
    id: number;
    status: import(".prisma/client").$Enums.AttendanceRequestStatus;
    createdAt: Date;
    updatedAt: Date;
    employeeId: number;
    date: Date;
    type: import(".prisma/client").$Enums.AttendanceRequestType;
    reason: string;
}>;
export declare const getAttendanceRequests: (query: GetAttendanceRequestsQuery) => Promise<{
    data: {
        id: number;
        status: import(".prisma/client").$Enums.AttendanceRequestStatus;
        createdAt: Date;
        updatedAt: Date;
        employeeId: number;
        date: Date;
        type: import(".prisma/client").$Enums.AttendanceRequestType;
        reason: string;
    }[];
    pagination: {
        total: number;
        pageIndex: number;
        pageSize: number;
    };
}>;
export declare const updateAttendanceRequestStatus: (id: number, status: AttendanceRequestStatus) => Promise<{
    id: number;
    status: import(".prisma/client").$Enums.AttendanceRequestStatus;
    createdAt: Date;
    updatedAt: Date;
    employeeId: number;
    date: Date;
    type: import(".prisma/client").$Enums.AttendanceRequestType;
    reason: string;
}>;
export declare const deleteAttendanceRequest: (id: number) => Promise<{
    id: number;
    status: import(".prisma/client").$Enums.AttendanceRequestStatus;
    createdAt: Date;
    updatedAt: Date;
    employeeId: number;
    date: Date;
    type: import(".prisma/client").$Enums.AttendanceRequestType;
    reason: string;
}>;
export {};
