const dotenv = require('dotenv').config();
const { Client } = require('@notionhq/client');
const { VerificationNotionCategoryList, VerificationNotionBookList } = require('./util/verification');

// 노션 클라이언트
const notionClient = new Client({
  auth: process.env.NOTION_KEY,
});
// 노션 DB 저장소 ID
const bookListNotionId = process.env.NOTION_BOOK_LIST;

// NOTION DB 저장소에 존재하는 카테고리를 가져오는 함수
exports.NotionCategoryList = async () => {
  // 도서 리스트를 담을 변수
  let results = [];
  // 노션에서 도서 리스트를 가져온다.
  const bookList = await notionClient.databases.query({
    database_id: bookListNotionId,
  });
  // 도서 리스트
  results = [...bookList.results];
  // 100개 이상인 경우 리스트 연장
  while (bookList.has_more) {
    const nextBookList = await notionClient.databases.query({
      database_id: bookListNotionId,
      start_cursor: bookList.next_cursor,
    });
    results = [...results, ...nextBookList.results];
  }
  // 데이터 전처리
  const verificationCategoryList = VerificationNotionCategoryList(results);
  // 중복제거 & 정렬
  const uniqueCategoryList = verificationCategoryList.filter(
    (category, idx) => verificationCategoryList.indexOf(category) === idx,
  ).sort((a, b) => a > b ? 1 : -1);

  return uniqueCategoryList;
};

// NOTION DB 저장소에 존재하는 장르 별 도서 목록을 가져오는 함수
exports.NotionBookListGroupByGenre = async (genre) => {
  // 도서 리스트를 담을 변수
  let results = [];
  // 정렬 옵션
  const orderBy = [
    {
      property: '도서명',
      direction: 'ascending',
    },
  ];
  // 필터 옵션
  const filter = {
    property: '장르',
    select: {
      equals: genre,
    },
  };
  // 노션에서 도서 리스트를 가져온다.
  const bookList = await notionClient.databases.query({
    database_id: bookListNotionId,
    sorts: orderBy, // 정렬
    filter, // 장르
  });
  // 도서 리스트
  results = [...bookList.results];
  // 100개 이상인 경우 리스트 연장
  while (bookList.has_more) {
    const nextBookList = await notionClient.databases.query({
      database_id: bookListNotionId,
      sorts: orderBy, // 정렬
      filter,
      start_cursor: bookList.next_cursor,
    });
    results = [...results, ...nextBookList.results];
  }
  // 데이터 전처리
  const verificationBookList = VerificationNotionBookList(results);

  return verificationBookList;
};

// NOTION DB 저장소에 존재하는 사용자 별 도서 목록을 가져오는 함수
exports.NotionBookListGroupByUser = async (userName) => {
  // 도서 리스트를 담을 변수
  let results = [];
  // 정렬 옵션
  const orderBy = [
    {
      property: '장르',
      direction: 'ascending',
    },
    {
      property: '도서명',
      direction: 'ascending',
    },
  ];
  // 필터 옵션
  const filter = {
    property: '대여자',
    rich_text: {
      contains: userName,
    },
  };
  // 노션에서 도서 리스트를 가져온다.
  const bookList = await notionClient.databases.query({
    database_id: bookListNotionId,
    sorts: orderBy, // 정렬
    filter, // 사용자
  });
  // 도서 리스트
  results = [...bookList.results];
  // 100개 이상인 경우 리스트 연장
  while (bookList.has_more) {
    const nextBookList = await notionClient.databases.query({
      database_id: bookListNotionId,
      sorts: orderBy, // 정렬
      filter,
      start_cursor: bookList.next_cursor,
    });
    results = [...results, ...nextBookList.results];
  }
  // 데이터 전처리
  const verificationBookList = VerificationNotionBookList(results);

  return verificationBookList;
};

// NOTION DB 저장소 도서 정보를 대여 상태로 업데이트하는 함수
exports.NotionUpdateRentBookInfo = async (pageId, userName, userId, returnDay) => {
  // 도서 정보 업데이트 ("상태" & "대여자" & "슬랙ID" & "반납예정일자" 속성)
  await notionClient.pages.update({
    page_id: pageId,
    properties: {
      상태: {
        type: 'select',
        select: { id: 'lRoP', name: '대여중', color: 'yellow' },
      },
      대여자: {
        type: 'rich_text',
        rich_text: [
          {
            type: 'text',
            text: {
              content: userName,
            },
          },
        ],
      },
      슬랙ID: {
        type: 'rich_text',
        rich_text: [
          {
            type: 'text',
            text: {
              content: userId,
            },
          },
        ],
      },
      반납예정일자: {
        type: 'date',
        date: { start: returnDay },
      },
    },
  });
}

// NOTION DB 저장소 도서 정보를 반납 상태로 업데이트하는 함수
exports.NotionUpdateReturnBookInfo = async (bookInfo) => {
  // 도서 정보 업데이트 ("상태" & "대여자" & "슬랙ID" & "반납예정일자" 속성)
  await notionClient.pages.update({
    page_id: bookInfo.id,
    properties: {
      상태: {
        type: 'select',
        select: { id: 'CST`', name: '대여가능', color: 'green' },
      },
      대여자: {
        type: 'rich_text',
        rich_text: [
          {
            type: 'text',
            text: {
              content: '',
            },
          },
        ],
      },
      슬랙ID: {
        type: 'rich_text',
        rich_text: [
          {
            type: 'text',
            text: {
              content: '',
            },
          },
        ],
      },
      반납예정일자: { type: 'date', date: null },
    },
  });
}