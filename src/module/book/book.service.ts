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
      // 변수 예외처리
      const genre = result.properties['장르']
        ? result.properties['장르']['select']['name']
        : '';
      const title = result.properties['도서명']
        ? result.properties['도서명']['title']['plain_text']
        : '';
      const author = result.properties['저자']
        ? result.properties['저자']['rich_text']['plain_text']
        : '';
      const link = result.properties['링크']
        ? result.properties['링크']['url']
        : '';
      const image = result.properties['이미지']
        ? result.properties['이미지']['files']['name']
        : '';
      const file = result.properties['첨부파일']['files']
        ? result.properties['첨부파일']['files']['file']['url']
        : '없음';
      const requester = result.properties['요청자']
        ? result.properties['요청자']['people']['name']
        : '';
      const date = result.properties['구매일자']
        ? result.properties['구매일자']['date']['start']
        : '';

      return {
        genre,
        title,
        author,
        link,
        image,
        file,
        requester,
        date,
      };
    });

    return bookList;
  }
}
