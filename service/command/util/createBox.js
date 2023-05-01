const { ACTION_ID_ENUM, ISSUE_IMAGE_ENUM } = require('../../../common/enum');

// 카테고리 장르별 설명 텍스트 switch-case 함수
exports.CategoryDescription = (category) => {
  return `${category} 관련 도서 목록을 불러옵니다.`;
};

// 노션에서 불러온 카테고리 데이터 블럭 변경 함수
exports.CreateCategoryListBox = (category) => {
  const box = [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `📌 *${category}*: ${this.CategoryDescription(category)}`,
      },
      accessory: {
        type: 'button',
        text: {
          type: 'plain_text',
          emoji: true,
          text: `${category} 도서 목록`,
        },
        value: `${category}`,
        action_id: ACTION_ID_ENUM.MODAL,
      },
    },
  ];

  return box;
};

// 카테고리 헤더 블럭 + 하단 부분 블럭 추가 함수
exports.CreateCompleteCategoryListBox = (categoryListBox, length) => {
  const blocks = [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `📓 ACG 사내 도서 카테고리 목록입니다.\n우측 버튼을 눌러 카테고리 분류별 도서 리스트를 확인해주세요.`,
      },
    },
    {
      type: 'divider',
    },
    ...categoryListBox,
    {
      type: 'divider',
    },
    {
      type: 'context',
      elements: [
        {
          type: 'image',
          image_url: ISSUE_IMAGE_ENUM.BOOK,
          alt_text: 'book',
        },
        {
          type: 'mrkdwn',
          text: `* 총 ${length}개의 도서 카테고리가 검색되었습니다.* `,
        },
      ],
    },
  ];

  return blocks;
};
