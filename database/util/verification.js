// 노션에서 불러온 카테고리 리스트 데이터 전처리 함수
exports.VerificationNotionCategoryList = (results) => {
  const result = results.map((result) => {
    // 변수 예외처리
    const genre = result.properties['장르'] ? result.properties['장르']['select']['name'] : '';

    return genre;
  });

  return result;
};

// 노션에서 불러온 도서 리스트 데이터 전처리 함수
exports.VerificationNotionBookList = (results) => {
  const result = results.map((result) => {
    // 변수 예외처리
    const genre = result.properties['장르'] ? result.properties['장르']['select']['name'] : '';
    const title = result.properties['도서명'] ? result.properties['도서명']['title'][0]['plain_text'] : '';
    const author = result.properties['저자']['rich_text'].length
      ? result.properties['저자']['rich_text'][0]['plain_text']
      : '';
    const score = result.properties['평점'].rollup.number;
    const replyCount = result.properties['후기(건)'].rollup.number;
    const link = result.properties['링크'] ? result.properties['링크']['url'] : '';
    const image = result.properties['이미지'] ? result.properties['이미지']['files'][0]['name'] : '';
    const file = result.properties['첨부파일']['files'].length
      ? result.properties['첨부파일']['files'][0]['file']['url']
      : null;
    const status = result.properties['상태']
      ? {
          name: result.properties['상태']['select']['name'],
          color: result.properties['상태']['select']['color'],
        }
      : '';
    const requester = result.properties['대여자']['rich_text'].length
      ? result.properties['대여자']['rich_text'][0]['plain_text']
      : null;
    const requesterId = result.properties['슬랙ID']['rich_text'].length
      ? result.properties['슬랙ID']['rich_text'][0]['plain_text']
      : null;
    const date = result.properties['반납예정일자']['date'] ? result.properties['반납예정일자']['date']['start'] : '불확실';
    const id = result.id;

    return {
      genre,
      title,
      author,
      score,
      replyCount,
      link,
      image,
      file,
      status,
      requester,
      requesterId,
      date,
      id,
    };
  });

  return result;
};