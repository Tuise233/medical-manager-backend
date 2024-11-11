import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RouterController } from './router.controller';
import { RouterService } from './router.service';
import { Router } from './router.entity';
import { Log } from 'src/log/log.entity';
import { LogService } from 'src/log/log.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([Router, Log])
    ],
    controllers: [RouterController],
    providers: [RouterService, LogService],
    exports: [RouterService]
})
export class RouterModule { }
