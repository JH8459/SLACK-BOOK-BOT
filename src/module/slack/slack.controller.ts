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
import { SlackService } from './slack.service';

@ApiTags('슬랙 이벤트 API')
@Controller('slack')
@SlackEventListener()
@SlackInteractivityListener()
export class SlackController {
  constructor(private readonly slackService: SlackService) {}

  /** '!맛집' 메시지 */
  @SlackEventHandler({
    eventType: 'message',
    filter: ({ event }) => event.text.includes('!책'),
  })
  async getBookList({ event }: IncomingSlackEvent<MessageEvent>) {
    this.slackService.getBookList(event);
  }

  @SlackInteractivityHandler(ACTION_ID_ENUM.BOOK_MORE)
  async getBookMoreList({
    channel,
    actions: [{ value }],
  }: IncomingSlackInteractivity) {
    this.slackService.getBookMoreList(channel, value);
  }
}
