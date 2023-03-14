import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { IncomingSlackEvent } from 'nestjs-slack-listener';
import { SLACK_EVENTS } from '../../common/slack.swagger';
import { SlackEventService } from './slack.service';

@ApiTags('슬랙 이벤트 API')
@Controller('slack')
export class SlackEventController {
  constructor(private readonly slackEventService: SlackEventService) {}

  /* [POST] '/slack/events' swagger setting */
  @ApiOperation(SLACK_EVENTS.POST.API_OPERATION)
  /* [POST] '/events' API */
  @Post('/events')
  async getSlackEventHandler(@Body() event: IncomingSlackEvent): Promise<any> {
    if (event.challenge) {
      return {
        challenge: event.challenge,
      };
    }
    // 슬랙 메시지 이벤트를 구독하는 요청
    const slackEvent = await this.slackEventService.getSlackEventHandler(event);
    // 응답
    const result = {
      message: '슬랙 이벤트',
      data: slackEvent,
    };

    return result;
  }

  @Post(`interactivity`)
  async getSlackInteractivity(@Body() params: { payload: string }) {
    // 슬랙 동작을 수행하는 요청
    const slackInteractivity =
      await this.slackEventService.getSlackInteractivity(
        JSON.parse(params.payload),
      );
    // 응답
    const result = {
      message: '슬랙 동작',
      data: slackInteractivity,
    };

    return result;
  }
}
