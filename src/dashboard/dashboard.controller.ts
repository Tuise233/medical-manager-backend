import { Controller, Get } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
    constructor(private readonly dashboardService: DashboardService) { }

    @Get('cards')
    async getCardData() {
        return await this.dashboardService.getCardData();
    }

    @Get('medicine-stock')
    async getMedicineStock() {
        return await this.dashboardService.getMedicineStock();
    }

    @Get('visit-trend')
    async getVisitTrend() {
        return await this.dashboardService.getVisitTrend();
    }

    @Get('department-visits')
    async getDepartmentVisits() {
        return await this.dashboardService.getDepartmentVisits();
    }
} 