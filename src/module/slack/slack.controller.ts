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

  @SlackEventHandler({
    eventType: 'message',
    filter: ({ event }) => event.text.includes('TEST'),
  })
  async slack({ event }: IncomingSlackEvent<MessageEvent>) {
    this.slackService.takeMemo(event);
  }
}
