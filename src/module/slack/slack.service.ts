import { Injectable } from '@nestjs/common';
import { InjectSlackClient, SlackClient } from 'nestjs-slack-listener';
import { BookService } from '../book/book.service';

@Injectable()
export class SlackService {
  constructor(
    private readonly bookService: BookService,
    @InjectSlackClient() private readonly slackClient: SlackClient,
  ) {}
  async getBookList(event: any) {
    const bookList = await this.bookService.getBookList();

    const bookListBox = bookList
      .map((book) => {
        return [
          {
            type: 'divider',
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*<${book['바로가기']}|${book['식당명']}>*\n★★★★★ 별점 시스템 개발중 🙏\n장르: ${book['장르']}`,
            },
          },
        ];
      })
      .reduce((acc, cur) => [...acc, ...cur]);

    await this.slackClient.chat.postMessage({
      channel: event.channel,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `📓 ACG 사내 도서 목록입니다. \n신규 도서를 추가하려면 우측 버튼을 눌러 저장소로 이동해 추가해주세요! 👉`,
          },
          accessory: {
            type: 'button',
            text: {
              type: 'plain_text',
              text: '노션DB 바로가기',
              emoji: true,
            },
            value: 'click_me_123',
            url: 'https://www.notion.so/d00d58cac0dd4d84a13451c10e2bfb3b?v=eaaa20065229422eb55cbaa3b9ae3ffa&pvs=4',
            action_id: 'button-action',
          },
        },

        ...bookListBox,
      ],
    });
  }
}
