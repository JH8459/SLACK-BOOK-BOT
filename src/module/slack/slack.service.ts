import { Injectable } from '@nestjs/common';
import { InjectSlackClient, SlackClient } from 'nestjs-slack-listener';
import { ACTION_ID_ENUM } from '../../common/constant/enum';
import { BookService } from '../book/book.service';

@Injectable()
export class SlackService {
  constructor(
    private readonly bookService: BookService,
    @InjectSlackClient() private readonly slackClient: SlackClient,
  ) {}
  async getBookList(event: any) {
    const { hasMore, bookList } = await this.bookService.getBookList();

    const bookListBox = bookList
      .map((book) => {
        // box
        const box: any = [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: book.file
                ? `*<${book.link}|${book.title}>*\n저자: ${book.author}\n분야: ${book.genre}\nE-BOOK: *<${book.file}|PDF 다운로드>*`
                : `*<${book.link}|${book.title}>*\n저자: ${book.author}\n분야: ${book.genre}`,
            },
            accessory: {
              type: 'image',
              image_url: book.image,
              alt_text: 'ACG Book Thumbnail',
            },
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `상태: ${book.status.name}`,
            },
          },
        ];

        if (book.requester) {
          box.push({
            type: 'context',
            elements: [
              {
                type: 'image',
                image_url:
                  'https://user-images.githubusercontent.com/83164003/225353904-5d0ed7dc-d7e1-456a-9e67-4caf14114fae.png',
                alt_text: 'Requester Thumbnail',
              },
              {
                type: 'plain_text',
                emoji: true,
                text: `대여자: ${book.requester}     일자: ${book.date}`,
              },
            ],
          });
        }

        box.push({
          type: 'divider',
        });

        return box;
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
        hasMore && {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: {
                type: 'plain_text',
                emoji: true,
                text: '더보기',
              },
              value: 'more',
              action_id: ACTION_ID_ENUM.BOOK_MORE,
            },
          ],
        },
      ],
    });
  }

  async getBookMoreList(channel, actionId: string) {
    const { hasMore, nextCursor, bookList } =
      await this.bookService.getBookNextList(actionId);

    const bookListBox = bookList
      .map((book) => {
        // box
        const box: any = [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: book.file
                ? `*<${book.link}|${book.title}>*\n저자: ${book.author}\n분야: ${book.genre}\nE-BOOK: *<${book.file}|PDF 다운로드>*`
                : `*<${book.link}|${book.title}>*\n저자: ${book.author}\n분야: ${book.genre}`,
            },
            accessory: {
              type: 'image',
              image_url: book.image,
              alt_text: 'ACG Book Thumbnail',
            },
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `상태: ${book.status.name}`,
            },
          },
        ];

        if (book.requester) {
          box.push({
            type: 'context',
            elements: [
              {
                type: 'image',
                image_url:
                  'https://user-images.githubusercontent.com/83164003/225353904-5d0ed7dc-d7e1-456a-9e67-4caf14114fae.png',
                alt_text: 'Requester Thumbnail',
              },
              {
                type: 'plain_text',
                emoji: true,
                text: `대여자: ${book.requester}     일자: ${book.date}`,
              },
            ],
          });
        }

        box.push({
          type: 'divider',
        });

        return box;
      })
      .reduce((acc, cur) => [...acc, ...cur]);

    await this.slackClient.chat.postMessage({
      channel,
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
        hasMore && {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: {
                type: 'plain_text',
                emoji: true,
                text: '더보기',
              },
              value: 'more',
              action_id: ACTION_ID_ENUM.BOOK_MORE,
            },
          ],
        },
      ],
    });
  }
}
