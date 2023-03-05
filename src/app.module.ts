import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NotionModule } from 'nestjs-notion';
import { NOTION_CONFIG } from './config/notion.config';
import { SlackModule } from './module/slack/slack.module';
import { LunchModule } from './module/lunch/lunch.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    NotionModule.forRootAsync(NOTION_CONFIG),
    LunchModule,
    SlackModule,
  ],
})
export class AppModule {}
