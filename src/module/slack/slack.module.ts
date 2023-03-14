import { Module } from '@nestjs/common';
import { SlackEventController } from './slack.controller';
import { SlackEventService } from './slack.service';

@Module({
  imports: [],
  controllers: [SlackEventController],
  providers: [SlackEventService],
})
export class SlackEventModule {}
