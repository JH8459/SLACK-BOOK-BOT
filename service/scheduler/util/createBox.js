const { REQUEST_STATUS_ENUM } = require('../../../common/enum');

// 구매 신청 도서의 상태 별 설명 텍스트 switch-case 함수
exports.StatusDescription = (status, requestInfo) => {
  switch (status) {
    case REQUEST_STATUS_ENUM.APPROVAL:
      return `💳 신청하신 *${requestInfo.title}* 구매가 완료되었습니다. 도서가 준비되어 등록되면 다시 알림을 드릴께요!\n\n`;
    case REQUEST_STATUS_ENUM.REJECT:
      return `신청하신 *${requestInfo.title}* 구매가 다음과 같은 사유로 거절되었습니다.\n👉 "${requestInfo.rejectReason}"\n\n`;
    case REQUEST_STATUS_ENUM.COMPLETE:
      return `✅ 신청하신 *${requestInfo.title}* 등록이 완료되었습니다. 지금 바로 대여가 가능합니다.\n\n`;
    default:
      return '';
  }
};

// 구매 신청한 도서의 진행 상태 슬랙 메시지 블럭을 만드는 함수
exports.CreateAlertMessageBox = (status, requestInfo) => {
  const blocks = [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `📌 <@${requestInfo.slackId}> 신청하신 "${requestInfo.title}" 도서가 *${requestInfo.status}* 상태로 변경되었습니다.`,
      },
    },
    {
      type: 'divider',
    },
    {
      type: 'context',
      elements: [
        {
          type: 'mrkdwn',
          text: `${this.StatusDescription(
            status,
            requestInfo,
          )}❓진행 상황에 대해 추가적인 문의가 필요한 경우 경영지원팀에게 DM 부탁드립니다!`,
        },
      ],
    },
  ];

  return blocks;
};
