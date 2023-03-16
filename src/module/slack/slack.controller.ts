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
import { SlackEventService } from './slackEvent.service';

@ApiTags('슬랙 이벤트 API')
@Controller('slack')
@SlackEventListener()
@SlackInteractivityListener()
export class SlackController {
  constructor(private readonly slackEventService: SlackEventService) { }

  /** '!맛집' message 이벤트 핸들러 */
  @SlackEventHandler({
    eventType: 'message',
    filter: ({ event }) => event.text.includes('!책'),
  })
  async getBookList({ event }: IncomingSlackEvent<MessageEvent>) {
    this.slackEventService.getBookList(event);
  }

  /** action 핸들러 */
  @SlackInteractivityHandler(ACTION_ID_ENUM.BOOK_MORE)
  async getBookMoreList({
    channel: { id },
    actions: [{ action_id, value }],
  }: IncomingSlackInteractivity) {
    console.log('✅', id)
    console.log('✅', action_id)
    console.log('✅', value)
  }
}
