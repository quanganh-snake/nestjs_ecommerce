export type TApiSuccessResponse = {
    success: boolean,
    data: any,
    message: string,
    meta?: any
}

export type TApiErrorResponse = {
    success: boolean,
    error: any,
    message: string,
}