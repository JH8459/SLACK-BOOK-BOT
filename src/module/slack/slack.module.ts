import { Module } from '@nestjs/common';
import { LunchModule } from '../lunch/lunch.module';
import { SlackController } from './slack.controller';
import { SlackService } from './slack.service';

@Module({
  imports: [LunchModule],
  controllers: [SlackController],
  providers: [SlackService],
})
export class SlackModule {}
