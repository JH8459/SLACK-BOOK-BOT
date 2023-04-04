const dotenv = require('dotenv').config();
const { Client } = require('@notionhq/client');
const { NotionBookListGroupByUser, NotionUpdateRentBookInfo } = require('./bookList');
const { YN_ENUM } = require('../common/enum');

// 노션 클라이언트
const notionClient = new Client({
  auth: process.env.NOTION_KEY,
});
// 노션 DB 저장소 ID
const rentListNotionId = process.env.NOTION_RENTAL_LIST;

// NOTION DB(도서 대출 관리대장 DB) 생성 (관계 설정)
exports.NotionCreateRentInfo = async (pageId, userName, returnDay) => {
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
}

// NOTION DB를 조회해 대여 가능여부를 리턴하는 함수
exports.NotionRentBookInfo = async (pageId, userName, userId) => {
  // 대여 성공 여부를 판별하는 변수 rentYN 선언 (초기값 = 'N')
  let rentSuccessYN = YN_ENUM.NO;
  // 대여할 도서의 DB 정보를 가져오는 요청
  const rentBookInfo = await notionClient.pages.retrieve({ page_id: pageId })
  // userName의 사용자가 대여중인 도서 리스트를 가져오는 요청
  const rentList = await NotionBookListGroupByUser(userName);
  // 대여할 도서의 상태가 '대여가능' 상태이며 이미 대여중인 도서가 없는 경우에만 도서 대여 로직을 수행한다
  if (
    rentBookInfo.properties['상태']['select'].name === '대여가능' &&
    !rentList.length
  ) {
    // 반납일자를 담는 변수 "returnDay" 선언 (대여 신청 후 1주일 뒤로 Setting, Format: "YYYY-MM-DD")
    const offset = 1000 * 60 * 60 * 9;
    const today = new Date(new Date().getTime() + offset);
    today.setDate(today.getDate() + 7);
    const returnDay = today.toISOString().substring(0, 10);
    // 도서리스트 DB 대여 상태로 업데이트 ("상태" & "대여자" & "슬랙ID" & "반납예정일자" 속성 업데이트)
    await NotionUpdateRentBookInfo(pageId, userName, userId, returnDay);
    // 대출 관리대장 DB 생성
    await this.NotionCreateRentInfo(pageId, userName, returnDay);
    rentSuccessYN = YN_ENUM.YES;
  }
  // 대상 도서 정보(bookInfo)와 기존 도서 대여 목록(rentList) 그리고 대여 성공 유무(rentSuccessYN) 리턴
  return { rentBookInfo, rentList, rentSuccessYN };
};
