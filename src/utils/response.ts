import { TApiErrorResponse, TApiSuccessResponse } from "src/types/ApiResponse"

export const successResponse = (data: any, message: string, metadata?: any): TApiSuccessResponse => {
    const response: TApiSuccessResponse = {
        success: true,
        data,
        message,
        meta: metadata
    }
    return response
}

export const errorResponse = (error: any, message: string): TApiErrorResponse => {
    return {
        success: false,
        error,
        message
    }
}