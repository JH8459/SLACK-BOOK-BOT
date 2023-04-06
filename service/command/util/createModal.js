const { SUBMISSION_TYPE_ENUM } = require('../../../common/enum');

// 반납 모달 뷰 생성 함수
exports.CreateReturnBookModalView = (rentBookInfo, realName) => {
  const modalView = {
    type: 'modal',
    callback_id: SUBMISSION_TYPE_ENUM.RETURN_SUBMISSION,
    submit: {
      type: 'plain_text',
      text: '반납하기',
      emoji: true,
    },
    close: {
      type: 'plain_text',
      text: '취소',
      emoji: true,
    },
    title: {
      type: 'plain_text',
      text: `${
        rentBookInfo.title.length > 15 ? rentBookInfo.title.substr(0, 13) + '...' : rentBookInfo.title
      } 반납하기`,
      emoji: true,
    },
    blocks: [
      {
        type: 'section',
        text: {
          type: 'plain_text',
          text: `👋 안녕하세요 ${realName}님!\n\n도서 반납 전 평점과 후기를 남겨주시는건 어떨까요 ? 🤔`,
          emoji: true,
        },
      },
      {
        type: 'divider',
      },
      {
        type: 'input',
        block_id: 'star-section',
        label: {
          type: 'plain_text',
          text: '이 책은 전반적으로 어땠나요? ⭐️으로 알려주세요.',
          emoji: true,
        },
        element: {
          type: 'radio_buttons',
          action_id: 'input-star',
          options: [
            {
              text: {
                type: 'plain_text',
                text: '⭐️',
                emoji: true,
              },
              value: '1',
            },
            {
              text: {
                type: 'plain_text',
                text: '⭐️⭐️',
                emoji: true,
              },
              value: '2',
            },
            {
              text: {
                type: 'plain_text',
                text: '⭐️⭐️⭐️',
                emoji: true,
              },
              value: '3',
            },
            {
              text: {
                type: 'plain_text',
                text: '⭐️⭐️⭐️⭐️',
                emoji: true,
              },
              value: '4',
            },
            {
              text: {
                type: 'plain_text',
                text: '⭐️⭐️⭐️⭐️⭐️',
                emoji: true,
              },
              value: '5',
            },
          ],
        },
      },
      {
        type: 'input',
        block_id: 'reply-section',
        label: {
          type: 'plain_text',
          text: '이 책의 한줄 감상평을 남겨주세요.',
          emoji: true,
        },
        element: {
          type: 'plain_text_input',
          action_id: 'input-reply',
          multiline: true,
        },
        optional: true,
      },
    ],
  };

  return modalView;
};

// 구매 신청 모달 뷰 생성 함수
exports.CreateRequestBookModalView = (realName, userName) => {
  // 신청일시
  const date = new Date();
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours();
  const minutes = date.getMinutes();

  const modalView = {
    type: 'modal',
    callback_id: SUBMISSION_TYPE_ENUM.REQUEST_SUBMISSION,
    submit: {
      type: 'plain_text',
      text: '신청하기',
      emoji: true,
    },
    close: {
      type: 'plain_text',
      text: '취소',
      emoji: true,
    },
    title: {
      type: 'plain_text',
      text: 'ACG 사내 희망도서 신청하기',
      emoji: true,
    },
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `👋 안녕하세요 ${realName}님!\n\n희망도서 신청 하기 위해 하단의 빈칸을 채워주세요. (❗️ 필수입력)`,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*교보문고* 사이트 도서 정보를 활용해주세요!`,
        },
        accessory: {
          type: 'button',
          text: {
            type: 'plain_text',
            text: '📚 교보문고 바로가기',
            emoji: true,
          },
          value: 'link',
          url: 'https://www.kyobobook.co.kr/',
          action_id: 'input-link',
        },
      },
      {
        type: 'divider',
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `👤 *신청자*\n\n${userName}`,
          },
          {
            type: 'mrkdwn',
            text: `🗓️ *신청일시*\n\n${year}년 ${month}월 ${day}일 ${hour < 10 ? '0' + hour : hour}:${
              minutes < 10 ? '0' + minutes : minutes
            }`,
          },
        ],
      },
      {
        type: 'divider',
      },
      {
        type: 'input',
        block_id: 'purpose-section',
        element: {
          type: 'radio_buttons',
          options: [
            {
              text: {
                type: 'plain_text',
                text: '업무 (업무 목적은 횟수 제한이 없습니다.)',
                emoji: true,
              },
              value: '업무',
            },
            {
              text: {
                type: 'plain_text',
                text: '자기개발 (⚠️ 연간 2회 신청이 가능합니다.)',
                emoji: true,
              },
              value: '자기개발',
            },
          ],
          action_id: 'input-purpose',
        },
        label: {
          type: 'plain_text',
          text: '❗️ 목적',
          emoji: true,
        },
      },
      {
        type: 'input',
        block_id: 'title-section',
        element: {
          type: 'plain_text_input',
          action_id: 'input-title',
        },
        label: {
          type: 'plain_text',
          text: '❗️ 도서명',
          emoji: true,
        },
      },
      {
        type: 'input',
        block_id: 'author-section',
        element: {
          type: 'plain_text_input',
          action_id: 'input-author',
        },
        label: {
          type: 'plain_text',
          text: '❗️ 저자',
          emoji: true,
        },
      },
      {
        type: 'input',
        block_id: 'price-section',
        element: {
          type: 'number_input',
          is_decimal_allowed: false,
          action_id: 'input-price',
        },
        label: {
          type: 'plain_text',
          text: '❗️ 가격',
          emoji: true,
        },
      },
      {
        type: 'input',
        block_id: 'url-section',
        element: {
          type: 'url_text_input',
          action_id: 'input-url',
        },
        label: {
          type: 'plain_text',
          text: '❗️ 구매링크',
          emoji: true,
        },
      },
      {
        type: 'input',
        block_id: 'reason-section',
        label: {
          type: 'plain_text',
          text: '신청사유를 입력해주세요.',
          emoji: true,
        },
        element: {
          type: 'plain_text_input',
          action_id: 'input-reason',
          multiline: true,
        },
        optional: true,
      },
    ],
  };

  return modalView;
};
