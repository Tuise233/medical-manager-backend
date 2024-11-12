import { PageDto } from "src/common/dto/page.dto";

export class SearchAnnounceDto extends PageDto {
    getType: 'all' | 'valid';
    searchValue: string;
    type: string;
    is_top: boolean;
    start_date: Date;
    end_date: Date;
}