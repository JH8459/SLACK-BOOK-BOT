// 반납 모달 뷰 생성 함수
exports.CreateReturnBookModal = (rentBookInfo, userName) => {
  const modalView = {
    type: 'modal',
    callback_id: 'return-submit',
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
      text: `${rentBookInfo.title.length > 15 ? rentBookInfo.title.substr(0, 13) + '...' : rentBookInfo.title} 반납하기`,
      emoji: true,
    },
    blocks: [
      {
        type: 'section',
        text: {
          type: 'plain_text',
          text: `👋 안녕하세요 ${userName}님!\n\n도서 반납 전 평점과 후기를 남겨주시는건 어떨까요 ? 🤔`,
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
          multiline: true,
        },
        optional: true,
      },
    ],
  };

  return modalView;
};