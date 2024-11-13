import { PageDto } from "src/common/dto/page.dto";
import { MedicationStatus } from "./medication.entity";

import { MedicationCategory } from "./medication.entity";

export class CreateMedicationDto {
    name: string;
    description?: string;
    price: number;
    amount: number;
    category: MedicationCategory;
    status: MedicationStatus;
}

export class UpdateMedicationDto {
    name?: string;
    description?: string;
    price?: number;
    amount?: number;
    category?: MedicationCategory;
    status?: MedicationStatus;
}

export class SearchMedicationDto extends PageDto {
    searchValue?: string;
    category?: MedicationCategory;
    status?: MedicationStatus;
    minPrice?: number;
    maxPrice?: number;
    minStock?: number;
    maxStock?: number;
}