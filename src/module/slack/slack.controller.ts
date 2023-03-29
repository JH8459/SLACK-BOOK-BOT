import { Controller } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiTags } from '@nestjs/swagger';
import {
  IncomingSlackEvent,
  IncomingSlackInteractivity,
  SlackEventHandler,
  SlackEventListener,
  SlackInteractivityHandler,
  SlackInteractivityListener,
} from 'nestjs-slack-listener';
import { ACTION_ID_ENUM } from '../../common/constant/enum';
import { SlackActionService } from './slackAction.service';
import { SlackEventService } from './slackEvent.service';

@ApiTags('슬랙 이벤트 API')
@Controller('slack')
@SlackEventListener()
@SlackInteractivityListener()
export class SlackController {
  constructor(
    private readonly configService: ConfigService,
    private readonly slackEventService: SlackEventService,
    private readonly slackActionService: SlackActionService,
  ) { }

  /** '!카테고리' message 이벤트 핸들러 */
  @SlackEventHandler({
    eventType: 'message',
    filter: ({ event }) => event.text.includes('!카테고리'),
  })
  async getCategoryList({ event }: IncomingSlackEvent<MessageEvent>) {
    this.slackEventService.getCategoryList(event);
  }

  /** '!책' message 이벤트 핸들러 */
  @SlackEventHandler({
    eventType: 'message',
    filter: ({ event }) => event.text.includes('!책'),
  })
  async getBookList({ event }: IncomingSlackEvent<MessageEvent>) {
    this.slackEventService.getBookList(event);
  }

  /** '!반납' message 이벤트 핸들러 */
  @SlackEventHandler({
    eventType: 'message',
    filter: ({ event }) => event.text.includes('!반납'),
  })
  async returnBook({ event }: IncomingSlackEvent<MessageEvent>) {
    this.slackEventService.returnBook(event);
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
