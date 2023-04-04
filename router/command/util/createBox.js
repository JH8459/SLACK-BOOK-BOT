const { ACTION_ID_ENUM } = require('../../../common/enum');

// 카테고리 장르별 설명 텍스트 switch-case 함수
exports.CategoryDescription = (category) => {
  switch (category) {
    case '경제/경영':
      return '경제/경영 관련 도서 목록을 불러옵니다.';
    case '정치/사회':
      return '정치/사회 관련 도서 목록을 불러옵니다.';
    case '기술/공학':
      return '기술/공학 관련 도서 목록을 불러옵니다.';
    case '자기계발':
      return '자기계발 관련 도서 목록을 불러옵니다.';
    case '컴퓨터/IT':
      return '컴퓨터/IT 관련 도서 목록을 불러옵니다.';
    case '인문':
      return '인문 관련 도서 목록을 불러옵니다.';
    default:
      return '';
  }
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
          image_url:
            'https://user-images.githubusercontent.com/83164003/225353904-5d0ed7dc-d7e1-456a-9e67-4caf14114fae.png',
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
