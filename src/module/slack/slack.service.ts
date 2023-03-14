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
    const lunchList = await this.lunchService.getLunchList();

    const lunchListBox = lunchList
      .map((lunch) => {
        return [
          {
            type: 'divider',
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*<${lunch['바로가기']}|${lunch['식당명']}>*\n★★★★★\n장르: ${lunch['장르']}`,
            },
          },
        ];
      })
      .reduce((acc, cur) => [...acc, ...cur]);

    console.log(lunchListBox);

    await this.slackClient.chat.postMessage({
      channel: event.channel,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: 'ACG 맛집 리스트 🍚 \n⚠️ 대외비 ⚠️',
          },
        },
        {
          type: 'divider',
        },
        ...lunchListBox,
      ],
    });
  }
}
