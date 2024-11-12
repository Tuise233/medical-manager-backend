import { AnnounceType } from "../announcement.entity";

export class UpdateAnnounceDto {
    title: string;
    description: string;
    expire_date: Date;
    type: AnnounceType;
    is_top?: boolean;
}