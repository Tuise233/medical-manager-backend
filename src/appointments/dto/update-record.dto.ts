export class UpdateRecordDto {
    record: {
        chief_complaint?: string;
        present_illness?: string;
        past_history?: string;
        physical_exam?: string;
        diagnosis?: string;
        treatment_plan?: string;
        note?: string;
        status?: number;
    };

    prescriptions: {
        id?: number;
        type?: number;
        description?: string;
        frequency?: string;
        dosage?: string;
        duration?: number;
        note?: string;
        status?: number;
    }[];
} 