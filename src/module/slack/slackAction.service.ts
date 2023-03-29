import { Injectable } from '@nestjs/common';
import { InjectSlackClient, SlackClient } from 'nestjs-slack-listener';
import { YN_ENUM } from '../../common/constant/enum';
import { BookService } from '../book/book.service';
import { CreateBookListBox, CreateCompleteBookListBox, CreateCompleteBookListModal } from './util/utility';

@Injectable()
// 슬랙 액션
export class SlackActionService {
  constructor(
    private readonly bookService: BookService,
    @InjectSlackClient() private readonly slackClient: SlackClient,
  ) { }

  async rentBook(channel, value, userId): Promise<any> {
    // 슬랙 유저 정보 조회
    const user = await this.slackClient.users.info({ user: userId })
    // 노션DB 업데이트 (도서리스트 DB UPDATE && 도서대출 관리대장 DB CREATE) 후 대여 할 책의 정보를 가져오는 요청
    const { bookInfo, rentList, rentSuccessYN } = await this.bookService.rentBook(value, user.user.real_name, userId)
    // 대여가 실패하는 경우 에러 분기
    if (rentSuccessYN === YN_ENUM.NO) {
      if (rentList.length) {
        // 사용자가 대여중인 책이 1권 이상 존재하는 경우
        // 대여 실패 슬랙 메시지 알림
        await this.slackClient.chat.postMessage({
          channel,
          text: `⚠️ ${user.user.real_name}님은 "${rentList[0].title}" 도서를 ${rentList[0].date}까지 이미 대여중입니다. 기존 도서를 반납 후 다시 대여를 시도해주세요.`,
        });
      } else {
        // 대여중인 책을 다시 누르는 경우
        // 노션에서 도서 리스트를 가져오는 요청
        const bookList = await this.bookService.getBookList();
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
        const completeBookListBox = CreateCompleteBookListBox(bookListBox, bookList.length);
        // 대여 실패 슬랙 메시지 알림
        await this.slackClient.chat.postMessage({
          channel,
          text: `⚠️ "${bookInfo.properties['도서명']['title'][0]['plain_text']}" 도서는 ${bookInfo.properties['대여자']['rich_text'][0]['plain_text']}님이 대여중입니다. 도서 리스트를 다시 불러옵니다.`,
        });
        // 도서 리스트 호출
        await this.slackClient.chat.postMessage({
          channel,
          blocks: completeBookListBox
        });
      }

    } else {
      // 대여가 성공하는 경우
      // 슬랙 메시지 알림
      await this.slackClient.chat.postMessage({
        channel,
        text: `✅ ${user.user.real_name}님이 ${bookInfo.properties['도서명']['title'][0]['plain_text']}" 도서를 1주일간 대여했습니다.`
      });
    }
  }

  async bookListModal(genre: string, triggerId: string): Promise<any> {
    // 노션에서 장르별 도서 리스트를 가져오는 요청
    const bookList = await this.bookService.getBookListGroupByGenre(genre);
    // 노션에서 가져온 데이터를 슬랙 블럭(도서 블럭) 형태로 제작한다
    const bookListBox = bookList
      .map((book) => {
        // Box를 만들어주는 함수
        const box = CreateBookListBox(book);

        return box;
      })
      // 박스 정렬
      .reduce((acc, cur) => [...acc, ...cur]);
    // 블럭들을 조합해 온전한 슬랙 모달을 제작한다.
    const completeBookListModal: any = CreateCompleteBookListModal(
      genre,
      bookListBox,
      bookList.length,
    );

    await this.slackClient.views.open({
      trigger_id: triggerId,
      view: completeBookListModal,
    })
  }
}
