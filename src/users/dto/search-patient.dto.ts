import { PageDto } from "src/common/dto/page.dto";

export class SearchPatientDto extends PageDto {
    searchValue?: string;      // 搜索关键词(用户名/真实姓名)
} 