import { Module } from '@nestjs/common';
import { BookModule } from '../book/book.module';
import { SlackController } from './slack.controller';
import { SlackActionService } from './slackAction.service';
import { SlackEventService } from './slackEvent.service';

@Module({
  imports: [BookModule],
  controllers: [SlackController],
  providers: [SlackActionService, SlackEventService],
})
export class SlackModule { }
