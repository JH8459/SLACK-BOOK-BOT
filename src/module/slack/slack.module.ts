import { Module } from '@nestjs/common';
import { SlackModule } from 'nestjs-slack';
import { SLACK_WEB_API_CONFIG } from '../../config/slack.config';
import { SlackEventController } from './slack.controller';
import { SlackEventService } from './slack.service';

@Module({
  imports: [SlackModule.forRootAsync(SLACK_WEB_API_CONFIG)],
  controllers: [SlackEventController],
  providers: [SlackEventService],
})
export class SlackEventModule {}
