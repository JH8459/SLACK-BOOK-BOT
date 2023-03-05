import { Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SLACK_EVENT } from '../../common/slack.swagger';
import { SlackService } from './slack.service';

@ApiTags('슬랙 이벤트 API')
@Controller('slack')
export class SlackController {
  constructor(private readonly slackService: SlackService) {}

  /* [POST] '/slack/event' swagger setting */
  @ApiOperation(SLACK_EVENT.POST.API_OPERATION)
  /* [POST] '/event' API */
  @Post('/event')
  async getSlackMessageEvent(): Promise<any> {
    // 슬랙 메시지 이벤트를 구독하는 요청
    const slackEvent = await this.slackService.getSlackMessageEvent();
    // 응답
    const result = {
      message: '슬랙 이벤트',
      data: slackEvent,
    };

    return result;
  }
}
