import { Controller } from '@nestjs/common';
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
  constructor(private readonly slackEventService: SlackEventService, private readonly slackActionService: SlackActionService) { }

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
    const result = await this.slackActionService.rentBook(channel.id, value, id)

    return result
  }
}
