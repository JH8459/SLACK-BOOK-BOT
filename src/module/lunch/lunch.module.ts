import { Module } from '@nestjs/common';
import { NotionModule } from 'nestjs-notion';
import { NOTION_CONFIG } from '../../config/notion.config';
import { LunchService } from './lunch.service';

@Module({
  imports: [NotionModule.forRootAsync(NOTION_CONFIG)],
  providers: [LunchService],
  exports: [LunchService],
})
export class LunchModule {}
