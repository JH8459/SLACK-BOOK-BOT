import { Controller, Post, Req } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiTags } from '@nestjs/swagger';
import {
  IncomingSlackEvent,
  IncomingSlackInteractivity,
  InjectSlackClient,
  SlackClient,
  SlackEventHandler,
  SlackEventListener,
  SlackInteractivityHandler,
  SlackInteractivityListener,
} from 'nestjs-slack-listener';
import { ACTION_ID_ENUM } from '../../common/constant/enum';
import { BookService } from '../book/book.service';
import { SlackActionService } from './slackAction.service';
import { SlackEventService } from './slackEvent.service';

@ApiTags('슬랙 이벤트 API')
@Controller('slack')
@SlackEventListener()
@SlackInteractivityListener()
export class SlackController {
  constructor(
    private readonly configService: ConfigService,
    private readonly bookService: BookService,
    private readonly slackEventService: SlackEventService,
    private readonly slackActionService: SlackActionService,
    @InjectSlackClient() private readonly slackClient: SlackClient,
  ) { }

  /** '!카테고리' message 이벤트 핸들러 */
  @SlackEventHandler({
    eventType: 'message',
    filter: ({ event }) => event.text.includes('!카테고리'),
  })
  async getCategoryList({ event }: IncomingSlackEvent<MessageEvent>) {
    await this.slackEventService.getCategoryListByChat(event);
  }

  /** '!책' message 이벤트 핸들러 */
  @SlackEventHandler({
    eventType: 'message',
    filter: ({ event }) => event.text.includes('!책'),
  })
  async getBookList({ event }: IncomingSlackEvent<MessageEvent>) {
    await this.slackEventService.getBookList(event);
  }

  /** '!반납' message 이벤트 핸들러 */
  @SlackEventHandler({
    eventType: 'message',
    filter: ({ event }) => event.text.includes('!반납'),
  })
  async returnBook({ event }: IncomingSlackEvent<MessageEvent>) {
    await this.slackEventService.returnBookByChat(event);
  }

  /** "/" 명령어 이벤트 핸들러 */
  @Post('slash')
  async getSlashCommand(@Req() { body }) {
    try {
      if (body.command === '/카테고리') {
        await this.slackEventService.getCategoryListByCommand(body.channel_id);
      } else if (body.command === '/반납') {
        // 슬랙 유저 정보 조회
        const user = await this.slackClient.users.info({ user: body.user_id })
        const rentBookList = await this.bookService.getBookList(user.user.real_name)
        if (rentBookList.length) {
          await this.slackActionService.returnModal(body.trigger_id, rentBookList, user);
        } else {
          return {
            response_type: "ephemeral",
            text: `⚠️ ${user.user.real_name}은 대여중인 도서가 없습니다.`
          }
        }
      }
    } catch (err) {
      console.log(err)
      return {
        response_type: "ephemeral",
        text: `⚠️ 일시적 오류가 발생했습니다. 다시 시도해주세요.`
      }
    }

  }

  /** MODAL submit 핸들러 */
  @SlackInteractivityHandler({
    filter: (event) => event.type.includes('view_submission')
  })
  async test(value: IncomingSlackInteractivity) {
    try {
      console.log('✅ value: ', value)
      console.log('✅ value: ', value['view'].state.values['star-section'])
      console.log('✅ value: ', value['view'].state.values['reply-section'])
      return;

    } catch (err) {
      console.log(err)
    }

  }

  /** RENT action 핸들러 */
  @SlackInteractivityHandler(ACTION_ID_ENUM.RENT)
  async rentBook({
    channel,
    user: { id },
    actions: [{ value }],
  }: IncomingSlackInteractivity) {
    // 모달에서 인입된 action은 채널을 알수없다
    const chnnelId = channel ? channel.id : this.configService.get<string>('SLACK_CHANNEL_ID')
    const result = await this.slackActionService.rentBook(chnnelId, value, id)

    return result;
  }

  /** MODAL action 핸들러 */
  @SlackInteractivityHandler(ACTION_ID_ENUM.MODAL)
  async bookListModal({
    actions: [{ value }],
    trigger_id,
  }: IncomingSlackInteractivity) {
    const result = await this.slackActionService.bookListModal(value, trigger_id)

    return result;
  }


}
