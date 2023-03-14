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

    await this.slackClient.chat.postMessage({
      channel: event.channel,
      text: '🙏 개발중입니다!',
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: 'Hi there! 👋🏻',
          },
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `Hello! Nice to meet you, ${event.user}! I'm *hanch*, a slack bot that helps you with onboarding process.`,
          },
        },
      ],
    });

    console.log('✅', lunchList);
  }
}
