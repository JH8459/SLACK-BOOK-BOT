import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { LUNCH_LIST } from '../../common/lunch.swagger';
import { LunchService } from './lunch.service';

@ApiTags('맛집 리스트 API')
@Controller('lunch')
export class LunchController {
  constructor(private readonly lunchService: LunchService) {}

  /* [GET] '/lunch' swagger setting */
  @ApiOperation(LUNCH_LIST.GET.API_OPERATION)
  /* [GET] '/lunch' API */
  @Get('/lunch')
  async getLunchList(): Promise<any> {
    // 맛집 리스트를 가져오는 요청
    const lunchList = await this.lunchService.getLunchList();
    // 응답
    const result = {
      message: '맛집 리스트를 조회합니다.',
      data: lunchList,
    };

    return result;
  }
}
