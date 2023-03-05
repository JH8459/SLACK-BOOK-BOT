import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createEventAdapter } from '@slack/events-api';

@Injectable()
export class SlackService {
  constructor(private readonly configService: ConfigService) {}

  async getSlackMessageEvent(): Promise<any> {
    const slackSigningSecret = this.configService.get('SLACK_KEY');
    const slackEvents = createEventAdapter(slackSigningSecret);

    return slackEvents;
  }
}
