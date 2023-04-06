// 노션 클라이언트
const dotenv = require('dotenv').config();
const { Client } = require('@notionhq/client');
const { REQUEST_TYPE_ENUM } = require('../common/enum');

// 노션 클라이언트
const notionClient = new Client({
  auth: process.env.NOTION_KEY,
});
// 노션 DB 저장소 ID
const requestListNotionId = process.env.NOTION_REQUEST_LIST;

// NOTION DB(도서 구매 신청 리스트 DB) 도서 구매 신청을 생성하는 함수
exports.NotionCreateRequestLogInfo = async (userName, purpose, title, author, price, url, reason) => {
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
