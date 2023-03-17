import { Injectable } from '@nestjs/common';
import { InjectSlackClient, SlackClient } from 'nestjs-slack-listener';
import { ACTION_ID_ENUM } from '../../common/constant/enum';
import { BookService } from '../book/book.service';
import { CreateBookListBox, CreateCompleteBookListBox } from './util/utility';

@Injectable()
// 슬랙 이벤트
export class SlackEventService {
  constructor(
    private readonly bookService: BookService,
    @InjectSlackClient() private readonly slackClient: SlackClient,
  ) { }
  async getBookList(event: any) {
    // 노션에서 도서 리스트를 가져오는 요청 (+페이지네이션 정보)
    const { hasMore, nextCursor, bookList } = await this.bookService.getBookList();
    // 노션에서 가져온 데이터를 슬랙 블럭(도서 블럭) 형태로 제작한다
    const bookListBox = bookList
      .map((book) => {
        // Box를 만들어주는 함수
        const box = CreateBookListBox(book);

        return box;
      })
      // 박스 정렬
      .reduce((acc, cur) => [...acc, ...cur]);
    // 블럭들을 조합해 온전한 슬랙 블럭을 제작한다.
    const completeBookListBox = CreateCompleteBookListBox(bookListBox, hasMore, nextCursor)

    await this.slackClient.chat.postMessage({
      channel: event.channel,
      blocks: completeBookListBox
    });
  }
}
