export class BaseResponse<T> {
    constructor(
        public code: number,
        public msg: string,
        public data: T,
    ) { }

    static success<T>(data: T, message = '成功'): BaseResponse<T> {
        return new BaseResponse(200, message, data);
    }

    static error<T>(message: string, code = 500, data: T = null): BaseResponse<T> {
        return new BaseResponse(code, message, data);
    }
} 