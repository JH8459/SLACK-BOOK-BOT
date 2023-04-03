import { ConfigModule, ConfigService } from '@nestjs/config';
import { SlackModuleAsyncOptions } from 'nestjs-slack-listener';

// SLACK_EVENT 설정 (SLACK_BOT_TOKEN .env에 저장한다.)
export const SLACK_EVENT_CONFIG: SlackModuleAsyncOptions = {
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: async (configService: ConfigService) => ({
    botToken: configService.get('SLACK_BOT_TOKEN'),
  }),
};
