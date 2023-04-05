const { App } = require('@slack/bolt');
const { CreateCategoryListBox } = require('./service/command/service');
const { ACTION_ID_ENUM, YN_ENUM, SUBMISSION_TYPE_ENUM } = require('./common/enum');
const { CreateBookListModal } = require('./service/action/service');
const { NotionRentBookInfo } = require('./database/rentList');
const { NotionBookListGroupByUser } = require('./database/bookList');
const { CreateReturnBookModal } = require('./service/command/util/createModal');
const { ReturnBookAlert } = require('./service/submission/service');
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
    const user = await client.users.info({user: command.user_id})
    // 반납 요청 유저의 기존 대여 도서 리스트 조회
    const rentBookList = await NotionBookListGroupByUser(
      user.user.real_name,
    );

    if (rentBookList.length) {
      // 장르 별 도서 리스트 모달 OPEN
      await client.views.open({
        trigger_id: command.trigger_id,
        view: CreateReturnBookModal(rentBookList[0], user.user.real_name)
      })
    } else {
      await client.chat.postEphemeral({
        channel: process.env.SLACK_CHANNEL_ID,
        user: command.user_id,
        text: `⚠️ ${user.user.real_name}님은 대여중인 도서가 없습니다.`,
      });
    }
  } catch (error) {
    console.log(error)
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
      view: bookBox
    })
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
    const user = await client.users.info({user: body.user.id})
    // 대상 도서 정보(bookInfo)와 기존 도서 대여 목록(rentList) 그리고 대여 성공 유무(rentSuccessYN) 정보 조회
    const { rentBookInfo, rentList, rentSuccessYN } = await NotionRentBookInfo(pageId, user.user.real_name, body.user.id)
    // 대여가 실패하는 경우 에러 분기
    if (rentSuccessYN === YN_ENUM.NO) {
      if (rentList.length) {
        // 사용자가 대여중인 책이 1권 이상 존재하는 경우
        // 대여 실패 슬랙 메시지 발송
        await client.chat.postEphemeral({
          channel: process.env.SLACK_CHANNEL_ID,
          user: body.user.id,
          text: `⚠️ ${user.user.real_name}님은 "${rentList[0].title}" 도서를 ${rentList[0].date}까지 이미 대여중입니다. 기존 도서를 반납 후 다시 대여를 시도해주세요.`,
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
        text: `✅ ${user.user.real_name}님이 ${rentBookInfo.properties['도서명']['title'][0]['plain_text']}" 도서를 1주일간 대여했습니다.`,
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
    // MODAL INPUT 값 (star & reply) 추출
    const starObjectKey = Object.keys(view.state.values['star-section'])[0];
    const star = view.state.values['star-section'][starObjectKey]['selected_option'].value;
    const replyKey = Object.keys(view.state.values['reply-section'])[0];
    const reply = view.state.values['reply-section'][replyKey].value;
    // 반납 요청 슬랙 유저 정보 조회
    const user = await client.users.info({user: body.user.id})
    // 유저 상태에 따른 반납 알림 메시지 & 반납 성공 상태 조회
    const { message, returnSuccessYn } = await ReturnBookAlert(user.user.real_name, star, reply);
    // returnSuccessYn에 따라 슬랙 메시지 알림
    returnSuccessYn === YN_ENUM.YES ? await client.chat.postMessage({
      channel: process.env.SLACK_CHANNEL_ID,
      text: `✅ ${user.user.real_name}님${message}`
    }) : await client.chat.postEphemeral({
      channel: process.env.SLACK_CHANNEL_ID,
      user: body.user.id,
      text: `⚠️ ${user.user.real_name}님${message}`,
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


// 슬랙 볼트 서버 실행
(async () => {
  await slackApp.start(process.env.SERVER_PORT || 3000);
  console.log('⚡️ Bolt app is running!');
})();
