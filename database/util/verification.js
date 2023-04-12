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
    console.log('✅ result: ', result.properties);
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
    const slackId = result.properties['슬랙ID']['rich_text'].length
      ? result.properties['슬랙ID']['rich_text'][0]['plain_text']
      : null;
    const date = result.properties['반납예정일자']['date']
      ? result.properties['반납예정일자']['date']['start']
      : '불확실';
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
      slackId,
      date,
      id,
    };
  });

  return result;
};

// 노션에서 불러온 구매 신청 리스트 데이터 전처리 함수
exports.VerificationNotionRequestList = (results) => {
  const result = results.map((result) => {
    // 변수 예외처리
    const requester = result.properties['신청자'] ? result.properties['신청자']['title'][0]['plain_text'] : '';
    const slackId = result.properties['슬랙ID']['rich_text'].length
      ? result.properties['슬랙ID']['rich_text'][0]['plain_text']
      : null;
    const purpose = result.properties['목적'].select.name;
    const status = result.properties['상태'].status.name;
    const rejectReason = result.properties['반려사유']['rich_text'].length
      ? result.properties['반려사유']['rich_text'][0]['plain_text']
      : null;
    const title = result.properties['도서명']['rich_text'][0]['plain_text'];
    const author = result.properties['저자']['rich_text'][0]['plain_text'];
    const price = result.properties['가격'].number;
    const url = result.properties['구매링크'].url;
    const requestReason = result.properties['신청사유']['rich_text'].length
      ? result.properties['신청사유']['rich_text'][0]['plain_text']
      : null;
    const requestDate = result.properties['신청일자'].date.start;
    const progressAlert = result.properties['진행알림'].checkbox;
    const finalAlert = result.properties['최종알림'].checkbox;
    const id = result.id;

    return {
      requester,
      slackId,
      purpose,
      status,
      rejectReason,
      title,
      author,
      price,
      url,
      requestReason,
      requestDate,
      progressAlert,
      finalAlert,
      id,
    };
  });

  return result;
};

// 노션에서 불러온 후기 리스트 데이터 전처리 함수
exports.VerificationNotionReplyList = (results) => {
  const switchStar = (score) => {
    switch (score) {
      case 1:
        return '⭐️';
      case 2:
        return '⭐️⭐️';
      case 3:
        return '⭐️⭐️⭐️';
      case 4:
        return '⭐️⭐️⭐️⭐️';
      case 5:
        return '⭐️⭐️⭐️⭐️⭐️';
    }
  };
  const result = results.map((result) => {
    // 변수 예외처리
    const reply = result.properties['한줄평']['rich_text'].length
      ? result.properties['한줄평']['rich_text'][0]['plain_text']
      : null;
    const score = switchStar(result.properties['별점'].number);
    const requester = result.properties['대여자'].title[0].text.content;
    const slackId = result.properties['슬랙ID']['rich_text'].length
      ? result.properties['슬랙ID']['rich_text'][0]['plain_text']
      : null;
    const createdAt = result.properties['생성일시'].created_time.substring(0, 10);

    return {
      reply,
      score,
      requester,
      slackId,
      createdAt,
    };
  });

  return result;
};
