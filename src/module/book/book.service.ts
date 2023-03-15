import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NotionService } from 'nestjs-notion';

@Injectable()
export class BookService {
  constructor(
    private readonly configService: ConfigService,
    private readonly notionService: NotionService,
  ) {}

  async getBookList(): Promise<any> {
    const notionBookList = await this.notionService.databases.query({
      database_id: this.configService.get('NOTION_BOOK_LIST'),
    });

    const bookList = notionBookList.results.map((result) => {
      return {
        식당명: result.properties['식당명']['title'][0]['plain_text'],
        장르: result.properties['장르']['select'].name,
        바로가기: result.properties['링크']['url'],
        만든이: result.properties['생성자']['created_by'].name,
        생성일: result.properties['생성 일시']['created_time'],
      };
    });

    return bookList;
  }
}
