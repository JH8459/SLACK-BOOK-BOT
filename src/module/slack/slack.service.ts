import { Injectable } from '@nestjs/common';
import { LunchService } from '../lunch/lunch.service';

@Injectable()
export class SlackService {
  constructor(private readonly lunchService: LunchService) {}
  async getLunchList(event: MessageEvent<any>) {
    const lunchList = await this.lunchService.getLunchList();

    console.log('✅', lunchList);
  }
}
