import { Injectable } from "@nestjs/common";
import { InjectSlackClient, SlackClient } from "nestjs-slack-listener";
import { ACTION_ID_ENUM } from '../../common/constant/enum';
import { BookService } from '../book/book.service';

@Injectable()
// 슬랙 이벤트
export class SlackActionService {
  constructor(
    private readonly bookService: BookService,
    @InjectSlackClient() private readonly slackClient: SlackClient,
  ) { }
}