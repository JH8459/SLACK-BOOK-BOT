const { NotionBookListGroupByGenre } = require('../../database/bookList');
const { CreateBookListBox, CreateCompleteBookListModal } = require('../util/createModal');

exports.CreateBookListModalByGenre = async (genre) => {
  // 노션에서 장르별 도서 리스트를 가져오는 요청
  const bookList = await NotionBookListGroupByGenre(genre);
  // 노션에서 가져온 데이터를 슬랙 블럭(도서 블럭) 형태로 제작한다
  const bookListBox = bookList
    .map((book) => {
      // Box를 만들어주는 함수
      const box = CreateBookListBox(book);

      return box;
    })
    // 박스 정렬
    .reduce((acc, cur) => [...acc, ...cur]);
  // 블럭들을 조합해 온전한 슬랙 블럭을 제작한다.
  const completeBookListModal = CreateCompleteBookListModal(genre, bookListBox, bookList.length);

  return completeBookListModal;
};
