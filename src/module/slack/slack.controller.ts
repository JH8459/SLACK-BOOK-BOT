import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  IncomingSlackEvent,
  SlackEventHandler,
  SlackEventListener,
} from 'nestjs-slack-listener';
import { SlackService } from './slack.service';

@ApiTags('슬랙 이벤트 API')
@Controller('slack')
@SlackEventListener()
export class SlackController {
  constructor(private readonly slackService: SlackService) {}

  /** '!맛집' 메시지 */
  @SlackEventHandler({
    eventType: 'message',
    filter: ({ event }) => event.text.includes('!맛집'),
  })
  async getLunchList({ event }: IncomingSlackEvent<MessageEvent>) {
    this.slackService.getLunchList(event);
  }
}
