// 도서 리스트를 cnt만큼 잘라서 분해하는 함수
exports.divisionList = (array, cnt) => {
  const length = array.length;
  const divide = Math.floor(length / cnt) + (Math.floor(length % cnt) > 0 ? 1 : 0);
  const newArray = [];

  for (let i = 0; i < divide; i++) {
    // 배열 0부터 n개씩 잘라 새 배열에 넣기
    newArray.push(array.splice(0, cnt));
  }

  return newArray;
};
