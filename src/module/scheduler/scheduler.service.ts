import { Injectable } from "@nestjs/common";
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from "@nestjs/schedule";
import { InjectSlackClient, SlackClient } from "nestjs-slack-listener";
import { BookService } from "../book/book.service";

@Injectable()
export class SchedulerService {
  constructor(
    private readonly configService: ConfigService,
    private readonly bookService: BookService,
    @InjectSlackClient() private readonly slackClient: SlackClient,
  ) { }
  // 모든 스케쥴러는 최소 1시간 단위의 네이밍을 지향한다.
  // 월~금 AM.9시 마다 반납예정일을 넘긴 대여자에게 DM을 발송한다.
  @Cron(CronExpression.MONDAY_TO_FRIDAY_AT_9AM)
  async alertBookMondayToFridayAtNinePM(): Promise<void> {
    // 슬랙 채널ID 정보
    const slackChannelId: string =
      this.configService.get('SLACK_CHANNEL_ID');
    // 미납된 도서 리스트를 가져오는 요청
    const delayedReturnBookList = await this.bookService.getDelayedReturnBookList();

    if (delayedReturnBookList.length) {
      const delayUserList = delayedReturnBookList.map((delayedReturnBook) => {
        // DM 포맷팅
        return '<@' + delayedReturnBook.requesterId + '>'
      })
      // 슬랙 메시지 알림
      await this.slackClient.chat.postMessage({
        channel: slackChannelId,
        text: `📌 ${delayUserList.join()} 반납 예정기간이 지난 도서가 있습니다. 확인 후 도서를 반납해주세요.`
      });
    }
  }
}