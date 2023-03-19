import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NotionService } from 'nestjs-notion';
import { Sort } from './interface/notion.interface';
import { VerificationNotionBookList } from './util/utility';

@Injectable()
export class BookService {
  constructor(
    private readonly configService: ConfigService,
    private readonly notionService: NotionService,
  ) { }

  async getBookList(): Promise<any> {
    // 노션 API를 호출 하기 위한 정보
    const bookListDatabaseId: string = this.configService.get('NOTION_BOOK_LIST');
    const orderBy: Sort[] = [
      {
        property: '장르',
        direction: "ascending",
      },
      {
        property: '도서명',
        direction: "ascending",
      },
    ]
    // 도서 리스트를 담을 변수
    let results = [];
    // 노션에서 도서 리스트를 가져온다.
    let bookList = await this.notionService.databases.query({
      database_id: bookListDatabaseId, // 도서 리스트 노션DB 저장소 ID
      sorts: orderBy, // 정렬
    });
    // 도서 리스트
    results = [...bookList.results]
    // 100개 이상인 경우 리스트 연장
    while (bookList.has_more) {
      const nextBookList = await this.notionService.databases.query({
        database_id: bookListDatabaseId, // 도서 리스트 노션DB 저장소 ID
        sorts: orderBy, // 정렬
        start_cursor: bookList.next_cursor,
      });
      results = [...results, ...nextBookList.results]
    }
    // results 데이터 전처리 후 리턴
    return VerificationNotionBookList(results);
  }

  async rentBook(value, userName: string): Promise<any> {
    // 노션 API를 호출 하기 위한 정보
    const rentListDatabaseId: string = this.configService.get('NOTION_RENTAL_LIST');

    const info = await this.notionService.pages.retrieve({ page_id: value })

    // 반납일자는 1주일 뒤 (YYYY-MM-DD)
    const today = new Date();
    today.setDate(today.getDate() + 7);
    const returnDay = today.toISOString().substring(0, 10);
    // 도서리스트 업데이트 (상태 & 대여자 & 반납예정일자)
    await this.notionService.pages.update({
      page_id: value, properties: {
        '상태': {
          type: 'select',
          select: { id: 'lRoP', name: '대여중', color: 'yellow' }
        },
        '대여자': {
          type: 'rich_text',
          rich_text: [{
            type: 'text', text: {
              content: userName
            }
          }]
        },
        '반납예정일자': {
          type: 'date',
          date: { start: returnDay }
        }
      }
    })
    // 도서 대출 관리대장 작성
    const rent = await this.notionService.pages.create({
      parent: { database_id: rentListDatabaseId }, properties: {
        '대여자': {
          type: 'title',
          title: [{
            type: 'text', text: {
              content: userName
            }
          }]
        },
        '반납예정일자': {
          type: 'date',
          date: { start: returnDay }
        }
      }
    })

    return rent;
  }
}
