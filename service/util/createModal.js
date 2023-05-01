const { ACTION_ID_ENUM, ISSUE_IMAGE_ENUM } = require('../../common/enum');

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
    book.replyCount
      ? {
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
              emoji: true,
            },
            value: book.id,
            action_id: ACTION_ID_ENUM.REPLY,
          },
        }
      : {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: book.score ? `⭐️: ${book.score.toFixed(2)}점` : `⭐️: 독서 평점이 없습니다.`,
          },
        },
    book.requester
      ? {
          type: 'context',
          elements: [
            {
              type: 'image',
              image_url: ISSUE_IMAGE_ENUM.BOOK,
              alt_text: 'Requester Thumbnail',
            },
            {
              type: 'plain_text',
              emoji: true,
              text: `대여자: ${book.requester}     반납예정일자: ${book.date}`,
            },
          ],
        }
      : {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `상태: ${book.status.name}`,
          },
          accessory: {
            type: 'button',
            text: {
              type: 'plain_text',
              text: '대여하기',
              emoji: true,
            },
            value: book.id,
            action_id: ACTION_ID_ENUM.RENT,
          },
        },
  ];
  // 구분선 추가
  box.push({
    type: 'divider',
  });

  return box;
};

// 도서 헤더 블럭 + 하단 부분 블럭 추가 함수
exports.CreateCompleteBookListModal = (text, bookListBox, total, page, totalPage) => {
  if (totalPage > 2) {
    // 구분선 추가
    bookListBox.unshift({
      type: 'divider',
    });
    bookListBox.unshift({
      type: 'actions',
      elements: [
        10 > (page - 1) * 10
          ? {
              type: 'button',
              text: {
                type: 'plain_text',
                text: `⚠️ 이전 페이지가 없습니다.`,
                emoji: true,
              },
              style: 'danger',
              value: `${page}`,
              confirm: {
                title: {
                  type: 'plain_text',
                  text: '잘못된 요청입니다.',
                },
                text: {
                  type: 'mrkdwn',
                  text: '⚠️ 첫페이지 입니다.',
                },
                confirm: {
                  type: 'plain_text',
                  text: '확인',
                },
                deny: {
                  type: 'plain_text',
                  text: '닫기',
                },
              },
            }
          : {
              type: 'button',
              text: {
                type: 'plain_text',
                text: `이전 (${(page - 1) * 10}/${total})`,
                emoji: true,
              },
              value: `${page}`,
              action_id: ACTION_ID_ENUM.PREV,
            },
        totalPage <= page
          ? {
              type: 'button',
              text: {
                type: 'plain_text',
                text: `⚠️ 다음 페이지가 없습니다.`,
                emoji: true,
              },
              style: 'danger',
              value: `${page}`,
              confirm: {
                title: {
                  type: 'plain_text',
                  text: '잘못된 요청입니다.',
                },
                text: {
                  type: 'mrkdwn',
                  text: '⚠️ 마지막 페이지입니다.',
                },
                confirm: {
                  type: 'plain_text',
                  text: '확인',
                },
                deny: {
                  type: 'plain_text',
                  text: '닫기',
                },
              },
            }
          : {
              type: 'button',
              text: {
                type: 'plain_text',
                text: `다음 (${total > (page + 1) * 10 ? (page + 1) * 10 : total}/${total})`,
                emoji: true,
              },
              value: `${page}`,
              action_id: ACTION_ID_ENUM.NEXT,
            },
      ],
    });
  }
  bookListBox.unshift({
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: `📚 * 총 ${total}건의 도서가 검색되었습니다.*`,
    },
  });
  bookListBox.pop();
  const modalView = {
    type: 'modal',
    title: {
      type: 'plain_text',
      emoji: true,
      text: `"${text}" 도서 목록입니다.`,
    },
    blocks: bookListBox,
  };

  return modalView;
};
