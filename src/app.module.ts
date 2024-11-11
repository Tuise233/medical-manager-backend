import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { RouterModule } from './router/router.module';
import { InfoModule } from './info/info.module';
import { AnnouncementModule } from './announcement/announcement.module';
import { LogModule } from './log/log.module';

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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
