const express = require('express');
const { getCategoryList } = require('../../database/bookList');
const { CreateCategoryListBox, CreateCompleteCategoryListBox } = require('./util/createBox');
const router = express.Router();

router.post('/slash', async ({ body }, res) => {
  try {
    if (body.command === '/카테고리') {
      // 노션에서 도서 장르 리스트를 가져오는 요청
      const categoryList = await getCategoryList();
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
    } else if (body.command === '/반납') {
    }
    res.send('hello world');
  } catch (err) {
    console.log('⚠️ Error: ', err);
    return {
      response_type: 'ephemeral',
      text: `⚠️ 일시적 오류가 발생했습니다. 다시 시도해주세요.`,
    };
  }
});

module.exports = router;
