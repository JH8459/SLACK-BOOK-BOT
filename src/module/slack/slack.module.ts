import { Module } from '@nestjs/common';
import { BookModule } from '../book/book.module';
import { SlackController } from './slack.controller';
import { SlackEventService } from './slackEvent.service';

@Module({
  imports: [BookModule],
  controllers: [SlackController],
  providers: [SlackEventService],
})
export class SlackModule { }
