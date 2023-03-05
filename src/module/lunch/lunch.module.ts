import { Module } from '@nestjs/common';
import { NotionModule } from 'nestjs-notion';
import { NOTION_CONFIG } from '../../config/notion.config';
import { LunchController } from './lunch.controller';
import { LunchService } from './lunch.service';

@Module({
  imports: [NotionModule.forRootAsync(NOTION_CONFIG)],
  controllers: [LunchController],
  providers: [LunchService],
})
export class LunchModule {}
