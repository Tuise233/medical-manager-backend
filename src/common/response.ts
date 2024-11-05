export class Response<T> {
    constructor(
        public code: number,
        public message: string,
        public data: T,
    ) { }

    static success<T>(data: T, message = '成功'): Response<T> {
        return new Response(200, message, data);
    }

    static error<T>(message: string, code = 500, data: T = null): Response<T> {
        return new Response(code, message, data);
    }
}