import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NotionService } from 'nestjs-notion';
import { VerificationNotionBookList } from './util/utility';

@Injectable()
export class BookService {
  constructor(
    private readonly configService: ConfigService,
    private readonly notionService: NotionService,
  ) {}

  async getBookList(): Promise<any> {
    const notionBookList = await this.notionService.databases.query({
      database_id: this.configService.get('NOTION_BOOK_LIST'), // 노션DB 저장소 ID
      page_size: 5, // 페이지네이션
      sorts: [
        // 정렬
        {
          property: '장르',
          direction: 'ascending',
        },
        {
          property: '도서명',
          direction: 'ascending',
        },
      ],
    });
    // notionBookList 데이터 전처리
    const bookList = VerificationNotionBookList(notionBookList);
    // 페이지네이션 정보 & 도서 리스트 정보
    const result = {
      hasMore: notionBookList.has_more,
      nextCursor: notionBookList.next_cursor,
      bookList,
    };
    return result;
  }

  async getBookNextList(nextCursor: string): Promise<any> {
    const notionBookList = await this.notionService.databases.query({
      database_id: this.configService.get('NOTION_BOOK_LIST'), // 노션DB 저장소 ID
      start_cursor: nextCursor,
      page_size: 5, // 페이지네이션
      sorts: [
        // 정렬
        {
          property: '장르',
          direction: 'ascending',
        },
        {
          property: '도서명',
          direction: 'ascending',
        },
      ],
    });
    // notionBookList 데이터 전처리
    const bookList = VerificationNotionBookList(notionBookList);
    // 페이지네이션 정보 & 도서 리스트 정보
    const result = {
      hasMore: notionBookList.has_more,
      nextCursor: notionBookList.next_cursor,
      bookList,
    };
    return result;
  }
}
