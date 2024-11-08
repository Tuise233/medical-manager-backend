import { PageDto } from "src/common/dto/page.dto";

export class SearchAnnounceDto extends PageDto {
    searchValue: string;
    valid: boolean;
}