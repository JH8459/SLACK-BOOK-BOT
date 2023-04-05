const { YN_ENUM } = require('../../common/enum');
const { NotionBookListGroupByUser, NotionUpdateReturnBookInfo } = require('../../database/bookList');
const { NotionUpdateReturnLogInfo } = require('../../database/rentList');

exports.ReturnBookAlert = async (userName, star, reply) => {
  // 노션에서 userName의 사용자가 대여중인 도서 리스트를 가져오는 요청
  const rentBookList = await NotionBookListGroupByUser(userName);
  // 대여중인 도서가 있는 경우에만 도서 반납 로직을 수행한다
  if (rentBookList.length) {
    // NOTION DB 저장소 도서 정보를 반납 상태로 업데이트하는 요청
    await NotionUpdateReturnBookInfo(rentBookList[0])
    // NOTION DB 저장소 도서 대출 기록 정보를 업데이트하는 요청
    await NotionUpdateReturnLogInfo(rentBookList[0], star, reply)
    // 반납 성공 CASE
    return {
      message: `이 "${rentBookList[0].title}" 도서를 반납했습니다.`,
      returnSuccessYn: YN_ENUM.YES,
    };
  } else {
    // 반납 실패 CASE
    return {
      message: '은 대여중인 도서가 없습니다.',
      returnSuccessYn: YN_ENUM.NO,
    };
  }
}
