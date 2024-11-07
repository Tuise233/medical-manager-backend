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

export class PageResponse<T> {
    code: number;
    message: string;
    data: {
        total: number;
        pageNum: number;
        pageSize: number;
        list: T[]
    };

    constructor(total: number, pageNum: number, pageSize: number, list: T[], message: string = '成功', code: number = 200) {
        this.code = code;
        this.message = message;
        this.data = {
            total,
            pageNum,
            pageSize,
            list
        };
    }


    static success<T>(total: number, pageNum: number, pageSize: number, list: T[]): PageResponse<T> {
        return new PageResponse(total, pageNum, pageSize, list);
    }

    static error<T>(message: string, code: number = 500): PageResponse<T> {
        return new PageResponse<T>(0, 1, 0, [], message, code);
    }
}