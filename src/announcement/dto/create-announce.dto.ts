import { AnnounceType } from "../announcement.entity";

export class CreateAnnounceDto {
    title: string;
    description: string;
    type: AnnounceType;
    is_top?: boolean;
    expire_date: Date;
}