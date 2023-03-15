import { Module } from '@nestjs/common';
import { BookModule } from '../book/book.module';
import { SlackController } from './slack.controller';
import { SlackService } from './slack.service';

@Module({
  imports: [BookModule],
  controllers: [SlackController],
  providers: [SlackService],
})
export class SlackModule {}
