import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NotionService } from 'nestjs-notion';

@Injectable()
export class LunchService {
  constructor(
    private readonly configService: ConfigService,
    private readonly notionService: NotionService,
  ) {}

  async getLunchList(): Promise<any> {
    const notionLunchList = await this.notionService.databases.query({
      database_id: this.configService.get('NOTION_LUNCH_LIST'),
    });

    const lunchList = notionLunchList.results.map((result) => {
      return {
        name: result.properties['식당명']['title'][0]['plain_text'],
        genre: result.properties['장르']['select'].name,
        link: result.properties['링크']['url'],
        createBy: result.properties['생성자']['created_by'].name,
        createdAt: result.properties['생성 일시']['created_time'],
      };
    });

    return lunchList;
  }
}
