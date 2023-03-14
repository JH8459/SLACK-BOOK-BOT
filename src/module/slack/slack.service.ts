import { Injectable } from '@nestjs/common';
import { InjectSlackClient, SlackClient } from 'nestjs-slack-listener';
import { LunchService } from '../lunch/lunch.service';

@Injectable()
export class SlackService {
  constructor(
    private readonly lunchService: LunchService,
    @InjectSlackClient() private readonly slackClient: SlackClient,
  ) {}
  async getLunchList(event: any) {
    console.log('✅', event);
    const lunchList = await this.lunchService.getLunchList();

    console.log('✅', lunchList);

    await this.slackClient.chat.postMessage({
      channel: event.channel,
      text: '🙏 개발중입니다!',
    });
  }
}
