const { App } = require('@slack/bolt');
const { CreateCategoryListBox } = require('./service/command/service');
const { ACTION_ID_ENUM, YN_ENUM, SUBMISSION_TYPE_ENUM } = require('./common/enum');
const { CreateBookListModal } = require('./service/action/service');
const { NotionRentBookInfo } = require('./database/rentList');
const { NotionBookListGroupByUser } = require('./database/bookList');
const { CreateReturnBookModalView, CreateRequestBookModalView } = require('./service/command/util/createModal');
const { ReturnBookAlert } = require('./service/submission/service');
const { NotionCreateRequestLogInfo } = require('./database/requestList');
const dotenv = require('dotenv').config();

// 슬랙 볼트 앱 초기화
const slackApp = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: false,
  // appToken: process.env.SLACK_APP_TOKEN,
});

/**
 *! Command Router List
 */
slackApp.command('/카테고리', async ({ ack, command, client }) => {
  await ack();
  try {
    // 카테고리 리스트를 불러온다
    const categoryBox = await CreateCategoryListBox();
    // 슬랙 메시지 발송
    await client.chat.postMessage({
      channel: command.channel_id,
      blocks: categoryBox,
    });
  } catch (error) {
    console.log(error);
    await client.chat.postEphemeral({
      channel: process.env.SLACK_CHANNEL_ID,
      user: command.user_id,
      text: `⚠️ 네트워크 환경으로 일시적인 오류가 발생했습니다. 다시 시도해주세요!`,
    });
  }
});

slackApp.command('/반납', async ({ ack, command, client }) => {
  await ack();
  try {
    // 반납 요청 슬랙 유저 정보 조회
    const user = await client.users.info({ user: command.user_id });
    // 반납 요청 유저의 기존 대여 도서 리스트 조회
    const rentBookList = await NotionBookListGroupByUser(user.user.profile.display_name);

    if (rentBookList.length) {
      // 장르 별 도서 리스트 모달 OPEN
      await client.views.open({
        trigger_id: command.trigger_id,
        view: CreateReturnBookModalView(rentBookList[0], user.user.real_name),
      });
    } else {
      await client.chat.postEphemeral({
        channel: process.env.SLACK_CHANNEL_ID,
        user: command.user_id,
        text: `⚠️ ${user.user.profile.display_name}님은 대여중인 도서가 없습니다.`,
      });
    }
  } catch (error) {
    console.log(error);
    await client.chat.postEphemeral({
      channel: process.env.SLACK_CHANNEL_ID,
      user: command.user_id,
      text: `⚠️ 네트워크 환경으로 일시적인 오류가 발생했습니다. 다시 시도해주세요!`,
    });
  }
});

slackApp.command('/신청', async ({ ack, command, client }) => {
  await ack();
  try {
    // 구매 신청 요청 슬랙 유저 정보 조회
    const user = await client.users.info({ user: command.user_id });
    await client.views.open({
      trigger_id: command.trigger_id,
      view: CreateRequestBookModalView(user.user.real_name, user.user.profile.display_name),
    });
  } catch (error) {
    console.log(error);
    await client.chat.postEphemeral({
      channel: process.env.SLACK_CHANNEL_ID,
      user: command.user_id,
      text: `⚠️ 네트워크 환경으로 일시적인 오류가 발생했습니다. 다시 시도해주세요!`,
    });
  }
});

/**
 *! Action Router List
 */
slackApp.action(ACTION_ID_ENUM.MODAL, async ({ ack, body, client }) => {
  await ack();
  try {
    const genre = body.actions[0].value;
    const bookBox = await CreateBookListModal(genre);
    // 장르 별 도서 리스트 모달 OPEN
    await client.views.open({
      trigger_id: body.trigger_id,
      view: bookBox,
    });
  } catch (error) {
    console.error(error);
    await client.chat.postEphemeral({
      channel: process.env.SLACK_CHANNEL_ID,
      user: body.user.id,
      text: `⚠️ 네트워크 환경으로 일시적인 오류가 발생했습니다. 다시 시도해주세요!`,
    });
  }
});

slackApp.action(ACTION_ID_ENUM.REPLY, async ({ ack, body, client }) => {
  await ack();
  try {
    await client.chat.postEphemeral({
      channel: process.env.SLACK_CHANNEL_ID,
      user: body.user.id,
      text: `⚠️ 후기 기능은 개발중입니다!`,
    });
  } catch (error) {
    console.error(error);
    await client.chat.postEphemeral({
      channel: process.env.SLACK_CHANNEL_ID,
      user: body.user.id,
      text: `⚠️ 네트워크 환경으로 일시적인 오류가 발생했습니다. 다시 시도해주세요!`,
    });
  }
});

slackApp.action(ACTION_ID_ENUM.RENT, async ({ ack, body, client }) => {
  await ack();
  try {
    const pageId = body.actions[0].value;
    // 대여 요청 슬랙 유저 정보 조회
    const user = await client.users.info({ user: body.user.id });
    // 대상 도서 정보(bookInfo)와 기존 도서 대여 목록(rentList) 그리고 대여 성공 유무(rentSuccessYN) 정보 조회
    const { rentBookInfo, rentList, rentSuccessYN } = await NotionRentBookInfo(
      pageId,
      user.user.profile.display_name,
      body.user.id,
    );
    // 대여가 실패하는 경우 에러 분기
    if (rentSuccessYN === YN_ENUM.NO) {
      if (rentList.length) {
        // 사용자가 대여중인 책이 1권 이상 존재하는 경우
        // 대여 실패 슬랙 메시지 발송
        await client.chat.postEphemeral({
          channel: process.env.SLACK_CHANNEL_ID,
          user: body.user.id,
          text: `⚠️ ${user.user.profile.display_name}님은 "${rentList[0].title}" 도서를 ${rentList[0].date}까지 이미 대여중입니다. 기존 도서를 반납 후 다시 대여를 시도해주세요.`,
        });
      } else {
        // 대여중인 책을 다시 누르는 경우 대여 실패 슬랙 메시지 알림
        await client.chat.postEphemeral({
          channel: process.env.SLACK_CHANNEL_ID,
          user: body.user.id,
          text: `⚠️ "${rentBookInfo.properties['도서명']['title'][0]['plain_text']}" 도서는 ${rentBookInfo.properties['대여자']['rich_text'][0]['plain_text']}님이 대여중입니다.`,
        });
      }
    } else {
      // 대여가 성공하는 경우
      // 슬랙 메시지 알림
      await client.chat.postMessage({
        channel: process.env.SLACK_CHANNEL_ID,
        text: `✅ <@${body.user.id}>님이 "${rentBookInfo.properties['도서명']['title'][0]['plain_text']}" 도서를 1주일간 대여했습니다.`,
      });
    }
  } catch (error) {
    console.error(error);
    await client.chat.postEphemeral({
      channel: process.env.SLACK_CHANNEL_ID,
      user: body.user.id,
      text: `⚠️ 네트워크 환경으로 일시적인 오류가 발생했습니다. 다시 시도해주세요!`,
    });
  }
});

/**
 *! SubMission Router List
 */
slackApp.view(SUBMISSION_TYPE_ENUM.RETURN_SUBMISSION, async ({ ack, body, view, client }) => {
  await ack();
  try {
    // 반납 요청 슬랙 유저 정보 조회
    const user = await client.users.info({ user: body.user.id });
    // 입력값 (별점, 후기)
    const star = view.state.values['star-section']['input-star']['selected_option'].value;
    const reply = view.state.values['reply-section']['input-reply'].value;
    // 유저 상태에 따른 반납 알림 메시지 & 반납 성공 상태 조회
    const { message, returnSuccessYn } = await ReturnBookAlert(user.user.profile.display_name, star, reply);
    // returnSuccessYn에 따라 슬랙 메시지 알림
    returnSuccessYn === YN_ENUM.YES
      ? await client.chat.postMessage({
          channel: process.env.SLACK_CHANNEL_ID,
          text: `✅ <@${body.user.id}>님${message}`,
        })
      : await client.chat.postEphemeral({
          channel: process.env.SLACK_CHANNEL_ID,
          user: body.user.id,
          text: `⚠️ ${user.user.profile.display_name}님${message}`,
        });
  } catch (error) {
    console.error(error);
    await client.chat.postEphemeral({
      channel: process.env.SLACK_CHANNEL_ID,
      user: body.user.id,
      text: `⚠️ 네트워크 환경으로 일시적인 오류가 발생했습니다. 다시 시도해주세요!`,
    });
  }
});

slackApp.view(SUBMISSION_TYPE_ENUM.REQUEST_SUBMISSION, async ({ ack, body, view, client }) => {
  await ack();
  try {
    // 구매 신청 요청 슬랙 유저 정보 조회
    const user = await client.users.info({ user: body.user.id });
    // 입력값 (목적, 도서명, 저자, 가격, URL, 사유)
    const purpose = view.state.values['purpose-section']['input-purpose']['selected_option'].value;
    const title = view.state.values['title-section']['input-title'].value;
    const author = view.state.values['author-section']['input-author'].value;
    const price = view.state.values['price-section']['input-price'].value;
    const url = view.state.values['url-section']['input-url'].value;
    const reason = view.state.values['reason-section']['input-reason'].value;

    await NotionCreateRequestLogInfo(user.user.profile.display_name, purpose, title, author, price, url, reason);
  } catch (error) {
    console.error(error);
    await client.chat.postEphemeral({
      channel: process.env.SLACK_CHANNEL_ID,
      user: body.user.id,
      text: `⚠️ 네트워크 환경으로 일시적인 오류가 발생했습니다. 다시 시도해주세요!`,
    });
  }
});

// 슬랙 볼트 서버 실행
(async () => {
  await slackApp.start(process.env.SERVER_PORT || 3000);
  console.log('⚡️ Bolt app is running!');
})();
