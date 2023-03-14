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
              text: `*<${lunch['바로가기']}|${lunch['식당명']}>*\n★★★★★ 별점 시스템 개발중 🙏\n장르: ${lunch['장르']}`,
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
            text: `ACG 맛집 리스트 🍚\n맛집을 추가하려면 우측 버튼을 눌러 저장소로 이동해 추가해주세요! 👉`,
          },
          accessory: {
            type: 'button',
            text: {
              type: 'plain_text',
              text: '노션DB 바로가기',
              emoji: true,
            },
            value: 'click_me_123',
            url: 'https://www.notion.so/d00d58cac0dd4d84a13451c10e2bfb3b?v=eaaa20065229422eb55cbaa3b9ae3ffa&pvs=4',
            action_id: 'button-action',
          },
        },

        ...lunchListBox,
      ],
    });
  }
}
