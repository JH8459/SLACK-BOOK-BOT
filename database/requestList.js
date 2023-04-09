// 노션 클라이언트
const dotenv = require('dotenv').config();
const { Client } = require('@notionhq/client');
const { REQUEST_TYPE_ENUM, REQUEST_STATUS_ENUM } = require('../common/enum');
const { VerificationNotionRequestList } = require('./util/verification');

// 노션 클라이언트
const notionClient = new Client({
  auth: process.env.NOTION_KEY,
});
// 노션 DB 저장소 ID
const requestListNotionId = process.env.NOTION_REQUEST_LIST;

// NOTION DB(도서 구매 신청 리스트 DB) 도서 구매 신청을 생성하는 함수
exports.NotionCreateRequestLogInfo = async (userName, slackId, purpose, title, author, price, url, reason) => {
  // 한국시간 계산 offSet 변수 선언
  const offset = 1000 * 60 * 60 * 9;

  await notionClient.pages.create({
    parent: { database_id: requestListNotionId },
    properties: reason
      ? {
          신청자: {
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
          목적: {
            type: 'select',
            select: {
              id: purpose === REQUEST_TYPE_ENUM.WORK ? ';HHd' : '}mOI',
              name: purpose,
              color: purpose === REQUEST_TYPE_ENUM.WORK ? 'gray' : 'yellow',
            },
          },
          도서명: {
            type: 'rich_text',
            rich_text: [
              {
                type: 'text',
                text: {
                  content: title,
                },
              },
            ],
          },
          저자: {
            type: 'rich_text',
            rich_text: [
              {
                type: 'text',
                text: {
                  content: author,
                },
              },
            ],
          },
          가격: {
            type: 'number',
            number: Number(price),
          },
          구매링크: {
            type: 'url',
            url: url,
          },
          신청사유: {
            type: 'rich_text',
            rich_text: [
              {
                type: 'text',
                text: {
                  content: reason,
                },
              },
            ],
          },
          신청일자: {
            type: 'date',
            date: {
              start: new Date(new Date().getTime() + offset).toISOString().substring(0, 10),
            },
          },
        }
      : {
          신청자: {
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
          목적: {
            type: 'select',
            select: {
              id: purpose === REQUEST_TYPE_ENUM.WORK ? ';HHd' : '}mOI',
              name: purpose,
              color: purpose === REQUEST_TYPE_ENUM.WORK ? 'gray' : 'yellow',
            },
          },
          도서명: {
            type: 'rich_text',
            rich_text: [
              {
                type: 'text',
                text: {
                  content: title,
                },
              },
            ],
          },
          저자: {
            type: 'rich_text',
            rich_text: [
              {
                type: 'text',
                text: {
                  content: author,
                },
              },
            ],
          },
          가격: {
            type: 'number',
            number: Number(price),
          },
          구매링크: {
            type: 'url',
            url: url,
          },
          신청일자: {
            type: 'date',
            date: {
              start: new Date(new Date().getTime() + offset).toISOString().substring(0, 10),
            },
          },
        },
  });
};

// NOTION DB(도서 구매 신청 리스트 DB) 도서 구매 신청 요청 리스트를 가져오는 함수
exports.NotionRequestList = async (status) => {
  // 필터 옵션
  const filter = {
    property: '상태',
    status: {
      equals: status,
    },
  };
  // 노션에서 도서 구매 신청 리스트를 가져온다.
  const requestBookList = await notionClient.databases.query({
    database_id: requestListNotionId,
    filter, // '신청' 상태
  });
  // 데이터 전처리
  const result = VerificationNotionRequestList(requestBookList.results);

  return result;
};

// NOTION DB(도서 구매 신청 리스트 DB) 도서 구매 신청 요청 리스트중 알림이 필요한 리스트를 가져오는 함수
exports.NotionRequestAlertList = async (status) => {
  // 필터에 담길 옵션 배열 선언
  const filterList = [
    {
      property: '상태',
      status: {
        equals: status,
      },
    },
  ];

  if (status === REQUEST_STATUS_ENUM.APPROVAL) {
    // 진행알림 CASE
    filterList.push({
      property: '진행알림',
      checkbox: {
        equals: false,
      },
    });
  } else if (status === REQUEST_STATUS_ENUM.COMPLETE || status === REQUEST_STATUS_ENUM.REJECT) {
    // 최종알림 CASE
    filterList.push({
      property: '최종알림',
      checkbox: {
        equals: false,
      },
    });
  }
  // 필터
  const filter = {
    and: filterList,
  };

  // 노션에서 알람 상태별 도서 구매 신청 리스트를 가져온다.
  const requestBookList = await notionClient.databases.query({
    database_id: requestListNotionId,
    filter,
  });
  // 데이터 전처리
  const result = VerificationNotionRequestList(requestBookList.results);

  return result;
};

// NOTION DB(도서 구매 신청 리스트 DB) 알림 상태를 업데이트하는 함수
exports.NotionRequestUpdateAlertInfo = async (pageId, status) => {
  // 알림 상태 업데이트 ("진행알림" or "최종알림")
  await notionClient.pages.update({
    page_id: pageId,
    properties:
      status === REQUEST_STATUS_ENUM.APPROVAL
        ? {
            진행알림: {
              type: 'checkbox',
              checkbox: true,
            },
          }
        : {
            최종알림: {
              type: 'checkbox',
              checkbox: true,
            },
          },
  });
};
