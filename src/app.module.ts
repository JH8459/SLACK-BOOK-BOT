import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NotionModule } from 'nestjs-notion';
import { NOTION_CONFIG } from './config/notion.config';
import { SLACK_EVENT_CONFIG } from './config/slack.config';
import { SlackEventModule } from './module/slack/slack.module';
import { LunchModule } from './module/lunch/lunch.module';
import { SlackModule } from 'nestjs-slack-listener';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    NotionModule.forRootAsync(NOTION_CONFIG),
    SlackModule.forRootAsync(SLACK_EVENT_CONFIG),
    LunchModule,
    SlackEventModule,
  ],
})
export class AppModule {}
