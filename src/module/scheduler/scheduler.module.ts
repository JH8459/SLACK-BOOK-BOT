import { Module } from "@nestjs/common";
import { BookModule } from '../book/book.module';
import { SlackModule } from '../slack/slack.module';
import { ScheduleModule } from "@nestjs/schedule";
import { SchedulerService } from "./scheduler.service";

@Module({
  imports: [
    ScheduleModule.forRoot(),
    BookModule,
    SlackModule
  ],
  providers: [SchedulerService],
})
export class SchedulerModule { }