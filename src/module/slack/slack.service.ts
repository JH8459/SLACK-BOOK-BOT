import { Injectable } from '@nestjs/common';

@Injectable()
export class SlackService {
  async takeMemo(event: any) {
    console.log('✅', event);
  }
}
