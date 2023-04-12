// 후기 리스트 모달 뷰 생성 함수
exports.CreateReplyModalView = (title, replyList) => {
  const replyListBox = [];

  replyList.map((replyInfo) => {
    const divierBox = {
      type: 'divider',
    };

    const headerBox = {
      type: 'context',
      elements: [
        {
          type: 'image',
          image_url: replyInfo.slackImg
            ? replyInfo.slackImg
            : 'https://user-images.githubusercontent.com/83164003/231494265-bf10c3fe-c49e-46e2-b0c6-a00cf83a0f9f.png',
          alt_text: 'profile',
        },
        {
          type: 'mrkdwn',
          text: `<@${replyInfo.slackId}>  |  ${replyInfo.createdAt}  |  ${replyInfo.score}\n`,
        },
      ],
    };

    const bodyBox = {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `${replyInfo.reply}`,
      },
    };

    replyListBox.push(divierBox);
    replyListBox.push(headerBox);
    replyListBox.push(bodyBox);
  });

  console.log('✅', replyListBox);

  const modalView = {
    type: 'modal',
    close: {
      type: 'plain_text',
      text: '취소',
      emoji: true,
    },
    title: {
      type: 'plain_text',
      text: `"${title.length > 15 ? title.substr(0, 13) + '...' : title}" 후기`,
      emoji: true,
    },
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `💬 ACG 구성원들의 도서 한줄평입니다.`,
        },
      },
      ...replyListBox,
    ],
  };

  return modalView;
};
