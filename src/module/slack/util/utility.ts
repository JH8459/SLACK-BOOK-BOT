import { ACTION_ID_ENUM } from '../../../common/constant/enum';

/** 장르별 설명 텍스트 switch-case 함수 */
export const CategoryDescription = (category) => {
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
}

/** 노션에서 불러온 카테고리 데이터 블럭 변경 함수 */
export const CreateCategoryListBox = (category) => {
  const box: any = [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `📌 *${category}*: ${CategoryDescription(category)}`,
      },
      accessory: {
        type: "button",
        text: {
          type: "plain_text",
          emoji: true,
          text: `${category} 도서 목록`
        },
        value: `${category}`,
        action_id: ACTION_ID_ENUM.MODAL,
      }
    },
  ];

  return box;
};

/** 도서 데이터 블럭 헤더 + 하단 부분 블럭 추가 함수 */
export const CreateCompleteCategoryListBox = (categoryListBox, length) => {
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

/** 노션에서 불러온 도서 데이터 블럭 변경 함수 */
export const CreateBookListBox = (book) => {
  const box: any = [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: book.file
          ? `* <${book.link} | ${book.title} >*\n저자: ${book.author}\n분야: ${book.genre}\nE - BOOK: * <${book.file} | PDF 다운로드 >* `
          : `* <${book.link} | ${book.title} >*\n저자: ${book.author}\n분야: ${book.genre}`,
      },
      accessory: {
        type: 'image',
        image_url: book.image,
        alt_text: 'ACG Book Thumbnail',
      },
    },
    book.requester ?
      {
        type: 'context',
        elements: [
          {
            type: 'image',
            image_url:
              'https://user-images.githubusercontent.com/83164003/225353904-5d0ed7dc-d7e1-456a-9e67-4caf14114fae.png',
            alt_text: 'Requester Thumbnail',
          },
          {
            type: 'plain_text',
            emoji: true,
            text: `대여자: ${book.requester}     반납예정일자: ${book.date}`,
          },
        ],
      } : {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `상태: ${book.status.name}`,
        },
        accessory: {
          type: "button",
          text: {
            type: 'plain_text',
            text: '대여하기',
            emoji: true,
          },
          value: book.id,
          action_id: ACTION_ID_ENUM.RENT,
        }
      },
  ];
  // 구분선 추가
  box.push({
    type: 'divider',
  });

  return box;
};

/** 도서 데이터 블럭 헤더 + 하단 부분 블럭 추가 함수 */
export const CreateCompleteBookListBox = (bookListBox, length) => {
  const blocks = [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `📓 ACG 사내 도서 목록입니다.\n모든 도서 목록을 자세히 확인하려면 우측 버튼을 눌러 저장소로 이동해주세요! 👉`,
      },
      accessory: {
        type: 'button',
        text: {
          type: 'plain_text',
          text: '노션DB 바로가기',
          emoji: true,
        },
        value: 'click_me_123',
        url: 'https://www.notion.so/d00d58cac0dd4d84a13451c10e2bfb3b?v=eaaa20065229422eb55cbaa3b9ae3ffa&pvs=4',
        action_id: 'button-action',
      },
    },
    {
      type: 'divider',
    },
    ...bookListBox,
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
          text: `* 총 ${length}건의 도서가 검색되었습니다.* `,
        },
      ],
    },
  ];

  return blocks;
};

/** 모달 내부 도서 데이터 블럭 헤더 + 하단 부분 블럭 추가 함수 */
export const CreateCompleteBookListModal = (genre: string, bookListBox, length: number) => {
  bookListBox.unshift({
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
        text: `* 총 ${length}건의 도서가 검색되었습니다.* `,
      },
    ],
  });
  bookListBox.pop();
  const modalView = {
    type: 'modal',
    title: {
      type: "plain_text",
      emoji: true,
      text: `"${genre}" 도서 목록입니다.`,
    },
    blocks: bookListBox
  }

  return modalView;
};

/** 반납 모달 생성 함수 */
export const CreateReturnBookModal = (rentBookInfo, user): any => {
  const modalView = {
    type: "modal",
    callback_id: "modal-return-inputs",
    submit: {
      type: "plain_text",
      text: "반납하기",
      emoji: true
    },
    close: {
      type: "plain_text",
      text: "취소",
      emoji: true
    },
    title: {
      type: "plain_text",
      text: `${rentBookInfo.title} 반납하기`,
      emoji: true
    },
    blocks: [
      {
        type: "section",
        text: {
          type: "plain_text",
          text: `👋 안녕하세요 ${user.user.real_name}님!\n\n도서 반납 전 평점과 후기를 남겨주시는건 어떨까요 ? 🤔`,
          emoji: true
        }
      },
      {
        type: "divider"
      },
      {
        type: "input",
        block_id: "star-section",
        label: {
          type: "plain_text",
          text: "이 책은 전반적으로 어땠나요? ⭐️으로 알려주세요.",
          emoji: true
        },
        element: {
          type: "radio_buttons",
          options: [
            {
              text: {
                type: "plain_text",
                text: "⭐️",
                emoji: true
              },
              value: "1"
            },
            {
              text: {
                type: "plain_text",
                text: "⭐️⭐️",
                emoji: true
              },
              value: "2"
            },
            {
              text: {
                type: "plain_text",
                text: "⭐️⭐️⭐️",
                emoji: true
              },
              value: "3"
            },
            {
              text: {
                type: "plain_text",
                text: "⭐️⭐️⭐️⭐️",
                emoji: true
              },
              value: "4"
            },
            {
              text: {
                type: "plain_text",
                text: "⭐️⭐️⭐️⭐️⭐️",
                emoji: true
              },
              value: "5"
            }
          ]
        }
      },
      {
        type: "input",
        block_id: "reply-section",
        label: {
          type: "plain_text",
          text: "이 책의 한줄 감상평을 남겨주세요.",
          emoji: true
        },
        element: {
          type: "plain_text_input",
          multiline: true
        },
        optional: true
      }
    ]
  };

  return modalView;
};
