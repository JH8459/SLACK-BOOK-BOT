const dotenv = require('dotenv').config();
const { Client } = require('@notionhq/client');
const { NotionBookListGroupByUser, NotionUpdateRentBookInfo } = require('./bookList');
const { YN_ENUM } = require('../common/enum');
const { VerificationNotionReplyList } = require('./util/verification');

// 노션 클라이언트
const notionClient = new Client({
  auth: process.env.NOTION_KEY,
});
// 노션 DB 저장소 ID
const rentListNotionId = process.env.NOTION_RENTAL_LIST;

// NOTION DB(도서 대출 관리대장 DB) 도서 대여 기록을 생성하는 함수
exports.NotionCreateRentLogInfo = async (pageId, userName, slackId, returnDay) => {
  await notionClient.pages.create({
    parent: { database_id: rentListNotionId },
    properties: {
      대여자: {
        type: 'title',
        title: [
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
              content: slackId,
            },
          },
        ],
      },
      도서명: {
        relation: [
          {
            id: pageId,
          },
        ],
      },
      반납예정일자: {
        type: 'date',
        date: { start: returnDay },
      },
    },
  });
};

// NOTION DB(도서 대출 관리대장 DB) 도서 반납 기록을 업데이트하는 함수
exports.NotionUpdateReturnLogInfo = async (bookInfo, star, reply) => {
  console.log('✅ bookInfo: ', bookInfo);
  console.log('✅ star: ', star);
  console.log('✅ reply: ', reply);
  // 필터 옵션
  const filter = {
    and: [
      {
        property: '도서명',
        relation: {
          contains: bookInfo.id,
        },
      },
      {
        property: '슬랙ID',
        rich_text: {
          contains: bookInfo.slackId,
        },
      },
      {
        property: '반납일자',
        date: {
          is_empty: true,
        },
      },
    ],
  };
  // 도서 대출 기록 조회 요청
  const rentLogList = await notionClient.databases.query({
    database_id: rentListNotionId, // 도서대출관리대장 노션DB 저장소 ID
    filter,
  });

  console.log('✅ rentLogList: ', rentLogList);

  // 한국시간 계산 offSet 변수 선언
  const offset = 1000 * 60 * 60 * 9;
  // 도서 대출 기록 정보 업데이트 ("반납일자", "별점", "한줄평*")
  await notionClient.pages.update({
    page_id: rentLogList.results[0].id,
    properties: reply
      ? {
          반납일자: {
            type: 'date',
            date: {
              start: new Date(new Date().getTime() + offset).toISOString().substring(0, 10),
            },
          },
          별점: {
            type: 'number',
            number: Number(star),
          },
          한줄평: {
            type: 'rich_text',
            rich_text: [
              {
                type: 'text',
                text: {
                  content: reply,
                },
              },
            ],
          },
        }
      : {
          반납일자: {
            type: 'date',
            date: {
              start: new Date(new Date().getTime() + offset).toISOString().substring(0, 10),
            },
          },
          별점: {
            type: 'number',
            number: Number(star),
          },
        },
  });
};

// NOTION DB를 조회해 대여 가능여부를 리턴하는 함수
exports.NotionRentBookInfo = async (pageId, userName, slackId) => {
  // 대여 성공 여부를 판별하는 변수 rentYN 선언 (초기값 = 'N')
  let rentSuccessYN = YN_ENUM.NO;
  // 대여할 도서의 DB 정보를 가져오는 요청
  const rentBookInfo = await notionClient.pages.retrieve({ page_id: pageId });
  // slackId의 사용자가 대여중인 도서 리스트를 가져오는 요청
  const rentList = await NotionBookListGroupByUser(slackId);
  // 대여할 도서의 상태가 '대여가능' 상태이며 이미 대여중인 도서가 없는 경우에만 도서 대여 로직을 수행한다
  if (rentBookInfo.properties['상태']['select'].name === '대여가능' && !rentList.length) {
    // 반납일자를 담는 변수 "returnDay" 선언 (대여 신청 후 1주일 뒤로 Setting, Format: "YYYY-MM-DD")
    const offset = 1000 * 60 * 60 * 9;
    const today = new Date(new Date().getTime() + offset);
    today.setDate(today.getDate() + 7);
    const returnDay = today.toISOString().substring(0, 10);
    // 도서리스트 DB 대여 상태로 업데이트 ("상태" & "대여자" & "슬랙ID" & "반납예정일자" 속성 업데이트)
    await NotionUpdateRentBookInfo(pageId, userName, slackId, returnDay);
    // 대출 관리대장 DB 생성
    await this.NotionCreateRentLogInfo(pageId, userName, slackId, returnDay);
    rentSuccessYN = YN_ENUM.YES;
  }
  // 대상 도서 정보(bookInfo)와 기존 도서 대여 목록(rentList) 그리고 대여 성공 유무(rentSuccessYN) 리턴
  return { rentBookInfo, rentList, rentSuccessYN };
};

// NOTION DB 저장소에 존재하는 장르 별 도서 목록을 가져오는 함수
exports.NotionReplyListGroupByTitle = async (titleId) => {
  // 후기 리스트를 담을 변수
  let results = [];
  // 정렬 옵션
  const orderBy = [
    {
      property: '생성일시',
      direction: 'descending',
    },
  ];
  // 필터 옵션
  const filter = {
    property: '도서명',
    relation: {
      contains: titleId,
    },
  };
  // 노션에서 후기 리스트를 가져온다.
  const replyList = await notionClient.databases.query({
    database_id: rentListNotionId,
    sorts: orderBy, // 정렬
    filter, // ID
  });
  // 후기 리스트
  results = [...replyList.results];
  // 100개 이상인 경우 리스트 연장
  while (replyList.has_more) {
    const nextReplyList = await notionClient.databases.query({
      database_id: rentListNotionId,
      sorts: orderBy, // 정렬
      filter,
      start_cursor: replyList.next_cursor,
    });
    results = [...results, ...nextReplyList.results];
  }

  // await Promise.all(
  //   results.map(async (result) => {
  //     const properties = {};

  //     for (const propertyName of Object.keys(result.properties)) {
  //       const propertyData = await notionClient.pages.properties.retrieve({
  //         page_id: result.id,
  //         property_id: result.properties[propertyName].id,
  //       });

  //       console.log('✅ propertyData: ', propertyData);

  //       properties[propertyName] = propertyData;
  //     }
  //     return properties;
  //   }),
  // );

  // 데이터 전처리
  const verificationReplyList = VerificationNotionReplyList(results);

  return verificationReplyList;
};
