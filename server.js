const { App } = require('@slack/bolt');
const { CreateCategoryListBox } = require('./service/command/service');
const { ACTION_ID_ENUM, YN_ENUM } = require('./common/enum');
const { CreateBookListModal } = require('./service/action/service');
const { NotionRentBookInfo } = require('./database/rentList');
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
      blocks: categoryBox
    })
  } catch (error) {
    console.log(error)
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
    // 슬랙 모달 OPEN
    await client.views.open({
      trigger_id: body.trigger_id,
      view: bookBox
    })
  } catch (error) {
    console.error(error);
  }
});

slackApp.action(ACTION_ID_ENUM.RENT, async ({ ack, body, client }) => {
  await ack();
  try {
    const pageId = body.actions[0].value;
    // 대여 요청 슬랙 유저 정보 조회
    const user = await client.users.info({user: body.user.id})
    // 대상 도서 정보(bookInfo)와 기존 도서 대여 목록(rentList) 그리고 대여 성공 유무(rentSuccessYN) 정보 조회
    const { rentBookInfo, rentList, rentSuccessYN } = await NotionRentBookInfo(pageId, user.user.real_name, body.user.id)
    // 대여가 실패하는 경우 에러 분기
    if (rentSuccessYN === YN_ENUM.NO) {
      if (rentList.length) {
        // 사용자가 대여중인 책이 1권 이상 존재하는 경우
        // 대여 실패 슬랙 메시지 발송
        await client.chat.postMessage({
          channel: process.env.SLACK_CHANNEL_ID,
          text: `⚠️ ${user.user.real_name}님은 "${rentList[0].title}" 도서를 ${rentList[0].date}까지 이미 대여중입니다. 기존 도서를 반납 후 다시 대여를 시도해주세요.`,
        });
      } else {
        // 대여중인 책을 다시 누르는 경우 대여 실패 슬랙 메시지 알림
        await client.chat.postMessage({
          channel: process.env.SLACK_CHANNEL_ID,
          text: `⚠️ "${rentBookInfo.properties['도서명']['title'][0]['plain_text']}" 도서는 ${rentBookInfo.properties['대여자']['rich_text'][0]['plain_text']}님이 대여중입니다.`,
        });
      }
    } else {
      // 대여가 성공하는 경우
      // 슬랙 메시지 알림
      await client.chat.postMessage({
        channel: process.env.SLACK_CHANNEL_ID,
        text: `✅ ${user.user.real_name}님이 ${rentBookInfo.properties['도서명']['title'][0]['plain_text']}" 도서를 1주일간 대여했습니다.`,
      });
    }
    
  } catch (error) {
    console.error(error);
  }
});

// 슬랙 볼트 서버 실행
(async () => {
  await slackApp.start(process.env.SERVER_PORT || 3000);
  console.log('⚡️ Bolt app is running!');
})();
