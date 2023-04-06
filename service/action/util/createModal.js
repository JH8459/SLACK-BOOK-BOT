const { ACTION_ID_ENUM } = require('../../../common/enum');

// 노션에서 불러온 도서 데이터 블럭 변경 함수
exports.CreateBookListBox = (book) => {
  const box = [
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
    book.replyCount ? {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: book.score ? `⭐️: ${book.score.toFixed(2)}점` : `⭐️: 독서 평점이 없습니다.`,
      },
      accessory: {
				type: 'button',
				text: {
					type: 'plain_text',
					text: `💬 후기 (${book.replyCount}건)`,
					emoji: true
				},
        value: book.id,
				action_id: ACTION_ID_ENUM.REPLY,
			}
    } : {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: book.score ? `⭐️: ${book.score.toFixed(2)}점` : `⭐️: 독서 평점이 없습니다.`,
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

// 도서 헤더 블럭 + 하단 부분 블럭 추가 함수
exports.CreateCompleteBookListModal = (genre, bookListBox, length) => {
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
      type: 'plain_text',
      emoji: true,
      text: `"${genre}" 도서 목록입니다.`,
    },
    blocks: bookListBox,
  };

  return modalView;
};
