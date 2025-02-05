import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/user.module';
import { RouterModule } from './router/router.module';
import { InfoModule } from './info/info.module';
import { AnnouncementModule } from './announcement/announcement.module';
import { LogModule } from './log/log.module';
import { AdminModule } from './admin/admin.module';
import { MedicationModule } from './medication/medication.module';
import { AppointmentModule } from './appointments/appointment.module';
import { DashboardModule } from './dashboard/dashboard.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'tuise233',
      database: 'medical',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: false
    }),
    TypeOrmModule.forFeature([]),
    UsersModule,
    RouterModule,
    InfoModule,
    AnnouncementModule,
    LogModule,
    AdminModule,
    MedicationModule,
    AppointmentModule,
    DashboardModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
