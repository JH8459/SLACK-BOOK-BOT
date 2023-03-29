import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NotionService } from 'nestjs-notion';
import { YN_ENUM } from '../../common/constant/enum';
import { Sort } from './interface/notion.interface';
import { VerificationNotionBookList, VerificationNotionCategoryList } from './util/utility';

@Injectable()
export class BookService {
  constructor(
    private readonly configService: ConfigService,
    private readonly notionService: NotionService,
  ) { }

  async getCategoryList(): Promise<any> {
    // 노션 API를 호출 하기 위한 정보
    const bookListDatabaseId: string =
      this.configService.get('NOTION_BOOK_LIST');
    // 카테고리 리스트를 담을 변수
    let results = [];
    // 노션에서 도서 리스트를 가져온다.
    const bookList = await this.notionService.databases.query({
      database_id: bookListDatabaseId, // 도서 리스트 노션DB 저장소 ID
    });
    // 도서 리스트
    results = [...bookList.results];
    // 100개 이상인 경우 리스트 연장
    while (bookList.has_more) {
      const nextBookList = await this.notionService.databases.query({
        database_id: bookListDatabaseId, // 도서 리스트 노션DB 저장소 ID
        start_cursor: bookList.next_cursor,
      });
      results = [...results, ...nextBookList.results];
    }
    // results 데이터 전처리 후 리턴
    return VerificationNotionCategoryList(results);
  }

  async getBookList(userName?: string): Promise<any> {
    // 노션 API를 호출 하기 위한 정보
    const bookListDatabaseId: string =
      this.configService.get('NOTION_BOOK_LIST');
    const orderBy: Sort[] = [
      {
        property: '장르',
        direction: 'ascending',
      },
      {
        property: '도서명',
        direction: 'ascending',
      },
    ];
    const filter = {
      property: '대여자',
      text: {
        contains: userName
      }
    }
    // 도서 리스트를 담을 변수
    let results = [];
    // 노션에서 도서 리스트를 가져온다.
    const bookList = await this.notionService.databases.query({
      database_id: bookListDatabaseId, // 도서 리스트 노션DB 저장소 ID
      sorts: orderBy, // 정렬
      filter: userName && filter,
    });
    // 도서 리스트
    results = [...bookList.results];
    // 100개 이상인 경우 리스트 연장
    while (bookList.has_more) {
      const nextBookList = await this.notionService.databases.query({
        database_id: bookListDatabaseId, // 도서 리스트 노션DB 저장소 ID
        sorts: orderBy, // 정렬
        start_cursor: bookList.next_cursor,
      });
      results = [...results, ...nextBookList.results];
    }
    // results 데이터 전처리 후 리턴
    return VerificationNotionBookList(results);
  }

  async getBookListGroupByGenre(genre: string): Promise<any> {
    // 노션 API를 호출 하기 위한 정보
    const bookListDatabaseId: string =
      this.configService.get('NOTION_BOOK_LIST');
    const orderBy: Sort[] = [
      {
        property: '도서명',
        direction: 'ascending',
      },
    ];
    const filter = {
      property: '장르',
      select: {
        equals: genre
      }
    }
    // 도서 리스트를 담을 변수
    let results = [];
    // 노션에서 도서 리스트를 가져온다.
    const bookList = await this.notionService.databases.query({
      database_id: bookListDatabaseId, // 도서 리스트 노션DB 저장소 ID
      sorts: orderBy, // 정렬
      filter, // 장르
    });
    // 도서 리스트
    results = [...bookList.results];
    // 100개 이상인 경우 리스트 연장
    while (bookList.has_more) {
      const nextBookList = await this.notionService.databases.query({
        database_id: bookListDatabaseId, // 도서 리스트 노션DB 저장소 ID
        sorts: orderBy, // 정렬
        filter,
        start_cursor: bookList.next_cursor,
      });
      results = [...results, ...nextBookList.results];
    }
    // results 데이터 전처리 후 리턴
    return VerificationNotionBookList(results);
  }

  async getDelayedReturnBookList(): Promise<any> {
    // 노션 API를 호출 하기 위한 정보
    const bookListDatabaseId: string =
      this.configService.get('NOTION_BOOK_LIST');
    const offset = 1000 * 60 * 60 * 9;
    const today = new Date(new Date().getTime() + offset).toISOString().substring(0, 10);
    const filter = {
      property: '반납예정일자',
      date: {
        before: today
      }
    }
    // 노션에서 도서 리스트를 가져온다.
    const bookList = await this.notionService.databases.query({
      database_id: bookListDatabaseId, // 도서 리스트 노션DB 저장소 ID
      filter,
    });
    // 데이터 전처리 후 리턴
    const result = VerificationNotionBookList(bookList.results);

    return result;
  }

  async rentBook(value, userName: string, userId: string): Promise<any> {
    // 노션 API를 호출 하기 위한 정보
    const rentListDatabaseId: string =
      this.configService.get('NOTION_RENTAL_LIST');
    // 대여할 도서의 DB 정보를 가져오는 요청
    const bookInfo = await this.notionService.pages.retrieve({ page_id: value })
    // userName의 사용자가 대여중인 도서 리스트를 가져오는 요청
    const rentList = await this.getBookList(userName);
    // 대여 성공 여부를 판별하는 변수 rentYN 선언 (초기값 = 'N')
    let rentSuccessYN = YN_ENUM.NO;
    // 대여할 도서의 상태가 '대여가능' 상태이며 이미 대여중인 도서가 없는 경우에만 도서 대여 로직을 수행한다
    if (bookInfo.properties['상태']['select'].name === '대여가능' && !rentList.length) {
      // 반납일자를 담는 변수 "returnDay" 선언 (대여 신청 후 1주일 뒤로 Setting, Format: "YYYY-MM-DD")
      const offset = 1000 * 60 * 60 * 9;
      const today = new Date(new Date().getTime() + offset);
      today.setDate(today.getDate() + 7);
      const returnDay = today.toISOString().substring(0, 10);
      // 도서리스트 DB 업데이트 ("상태" & "대여자" & "슬랙ID" & "반납예정일자" 속성 업데이트)
      await this.notionService.pages.update({
        page_id: value,
        properties: {
          상태: {
            type: 'select',
            select: { id: 'lRoP', name: '대여중', color: 'yellow' },
          },
          대여자: {
            type: 'rich_text',
            rich_text: [
              {
                type: 'text',
                text: {
                  content: userName,
                },
              },
            ],
          },
          슬랙ID: {
            type: 'rich_text',
            rich_text: [
              {
                type: 'text',
                text: {
                  content: userId,
                },
              },
            ],
          },
          반납예정일자: {
            type: 'date',
            date: { start: returnDay },
          },
        },
      });
      // 도서 대출 관리대장 DB 생성 (관계 설정)
      const param: any = {
        parent: { database_id: rentListDatabaseId },
        properties: {
          대여자: {
            type: 'title',
            title: [
              {
                type: 'text',
                text: {
                  content: userName,
                },
              },
            ],
          },
          도서명: {
            relation: [
              {
                id: value,
              },
            ],
          },
          반납예정일자: {
            type: 'date',
            date: { start: returnDay },
          },
        },
      }
      await this.notionService.pages.create(param);
      rentSuccessYN = YN_ENUM.YES;
    }
    // 대상 도서 정보(bookInfo)와 기존 도서 대여 목록(rentList) 그리고 대여 성공 유무(rentSuccessYN) 리턴
    return { bookInfo, rentList, rentSuccessYN };
  }

  async returnBook(userName: string): Promise<any> {
    // 노션 API를 호출 하기 위한 정보
    const rentListDatabaseId: string = this.configService.get('NOTION_RENTAL_LIST');
    // userName의 사용자가 대여중인 도서 리스트를 가져오는 요청
    const rentBookList = await this.getBookList(userName);
    // 대여중인 도서가 있는 경우에만 도서 반납 로직을 수행한다
    if (rentBookList.length) {
      // 도서리스트 DB 업데이트 ("상태" & "대여자" & "슬랙ID" & "반납예정일자" 속성 업데이트)
      await this.notionService.pages.update({
        page_id: rentBookList[0].id, properties: {
          '상태': {
            type: 'select',
            select: { id: 'CST`', name: '대여가능', color: 'green' }
          },
          '대여자': {
            type: 'rich_text',
            rich_text: [{
              type: 'text', text: {
                content: ''
              }
            }]
          },
          '슬랙ID': {
            type: 'rich_text',
            rich_text: [{
              type: 'text', text: {
                content: ''
              }
            }]
          },
          '반납예정일자': { type: 'date', date: null }
        }
      })
      // 도서대출관리대장 DB 업데이트 ("반납일자" 업데이트)
      const filter: any = {
        and: [
          {
            property: '도서명',
            relation: {
              contains: rentBookList[0].id
            }
          }, {
            property: '대여자',
            text: {
              equals: rentBookList[0].requester
            }
          }, {
            property: '반납일자',
            date: {
              is_empty: true
            }
          },

        ]
      }
      const rentList = await this.notionService.databases.query({
        database_id: rentListDatabaseId, // 도서대출관리대장 노션DB 저장소 ID
        filter,
      });
      const offset = 1000 * 60 * 60 * 9;
      await this.notionService.pages.update({
        page_id: rentList.results[0].id, properties: {
          '반납일자': { type: 'date', date: { start: new Date(new Date().getTime() + offset).toISOString().substring(0, 10) } }
        }
      })

      return { message: `이 "${rentBookList[0].title}" 도서를 반납했습니다.`, returnSuccessYn: YN_ENUM.YES };
    } else {
      return {
        message: '은 대여중인 도서가 없습니다.', returnSuccessYn: YN_ENUM.NO
      };
    }
  }
}
