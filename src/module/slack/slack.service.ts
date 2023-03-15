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
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*<${book.link}|${book.title}>*\n저자: ${book.author}\n분야: ${book.genre}\nE-BOOK: ${book.file}`,
            },
            accessory: {
              type: 'image',
              image_url: book['이미지'],
              alt_text: 'ACG Book Thumbnail',
            },
          },
          {
            type: 'context',
            elements: [
              {
                type: 'image',
                image_url:
                  'https://user-images.githubusercontent.com/83164003/225341790-052a6a7d-fa92-437b-8afe-7c40bf851e5d.png',
                alt_text: 'Requester Thumbnail',
              },
              {
                type: 'plain_text',
                emoji: true,
                text: `${book.requester} || ${book.date}`,
              },
            ],
          },
          {
            type: 'divider',
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
            text: `📓 ACG 사내 도서 목록입니다. \n도서를 추가하려면 우측 버튼을 눌러 저장소로 이동해 추가해주세요! 👉`,
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
        {
          type: 'divider',
        },
        ...bookListBox,
      ],
    });
  }
}
