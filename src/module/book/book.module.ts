import { Module } from '@nestjs/common';
import { NotionModule } from 'nestjs-notion';
import { NOTION_CONFIG } from '../../config/notion.config';
import { BookService } from './book.service';

@Module({
  imports: [NotionModule.forRootAsync(NOTION_CONFIG)],
  providers: [BookService],
  exports: [BookService],
})
export class BookModule {}
