import { PageDto } from "src/common/dto/page.dto";

export class SearchLogDto extends PageDto {
    startDate?: Date;
    endDate?: Date;
    searchValue?: string;
} 