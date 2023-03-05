import { ConfigModule, ConfigService } from '@nestjs/config';
import { NotionModuleAsyncOptions } from 'nestjs-notion';

// NOTION 설정 (NOTION_KEY는 .env에 저장한다.)
export const NOTION_CONFIG: NotionModuleAsyncOptions = {
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: async (configService: ConfigService) => ({
    auth: configService.get('NOTION_KEY'),
  }),
};
