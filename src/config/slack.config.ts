import { ConfigModule, ConfigService } from '@nestjs/config';
import { SlackModuleAsyncOptions } from 'nestjs-slack-listener';
import { SlackAsyncConfig } from 'nestjs-slack/dist/types';

// SLACK_EVENT 설정 (SLACK_KEY는 .env에 저장한다.)
export const SLACK_EVENT_CONFIG: SlackModuleAsyncOptions = {
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: async (configService: ConfigService) => ({
    botToken: configService.get('SLACK_KEY'),
  }),
};

// SLACK_WEB_API 설정 (SLACK_TOKEN은 .env에 저장한다.)
export const SLACK_WEB_API_CONFIG: SlackAsyncConfig = {
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: async (configService: ConfigService) => ({
    type: 'api',
    token: configService.get('SLACK_TOKEN'),
  }),
};
