const { NotionCategoryList, NotionBookListGroupBySearchText } = require('../../database/bookList');
const { CreateBookListBox, CreateCompleteBookListModal } = require('../util/createModal');
const { CreateCategoryListBox, CreateCompleteCategoryListBox } = require('./util/createBox');

exports.CreateCategoryListBox = async () => {
  // 노션에서 도서 장르 리스트를 가져오는 요청
  const categoryList = await NotionCategoryList();
  // 노션에서 가져온 데이터를 슬랙 블럭(카테고리 블럭) 형태로 제작한다
  const categoryListBox = categoryList
    .map((category) => {
      // Box를 만들어주는 함수
      const box = CreateCategoryListBox(category);

      return box;
    })
    // 박스 정렬
    .reduce((acc, cur) => [...acc, ...cur]);
  // 블럭들을 조합해 온전한 슬랙 블럭을 제작한다.
  const completeCategoryListBox = CreateCompleteCategoryListBox(categoryListBox, categoryListBox.length);

  return completeCategoryListBox;
};

exports.CreateBookListModalBySearchText = async (searchText) => {
  // 노션에서 검색어에 해당하는 도서 리스트를 가져오는 요청
  const bookList = await NotionBookListGroupBySearchText(searchText);

  if (!bookList.length) {
    return null;
  }
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
  const completeBookListModal = CreateCompleteBookListModal(searchText, bookListBox, bookList.length);

  return completeBookListModal;
};
