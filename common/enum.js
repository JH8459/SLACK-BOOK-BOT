const YN_ENUM = {
  YES: 'Y',
  NO: 'N',
};

const ISSUE_IMAGE_ENUM = {
  BOOK: 'https://user-images.githubusercontent.com/83164003/225353904-5d0ed7dc-d7e1-456a-9e67-4caf14114fae.png',
  SEARCH: 'https://user-images.githubusercontent.com/83164003/226113602-45fd6b61-b175-449b-8d33-7a8ee125d9b6.png',
  ACG: 'https://user-images.githubusercontent.com/83164003/231494265-bf10c3fe-c49e-46e2-b0c6-a00cf83a0f9f.png',
};

const REQUEST_TYPE_ENUM = {
  WORK: '업무',
  DEVELOPMENT: '자기개발',
};

const REQUEST_STATUS_ENUM = {
  REQUEST: '신청',
  CHECK: '검토중',
  APPROVAL: '승인',
  COMPLETE: '등록완료',
  REJECT: '반려',
};

const ACTION_ID_ENUM = {
  JOIN: 'team_join',
  RETURN_DATE: 'return-date',
  RENT: 'rent',
  MODAL: 'modal',
  REPLY: 'reply',
  REQUEST_INPUT_PURPOSE: 'input-purpose',
  REQUEST_INPUT_PURPOSE: 'input-title',
  REQUEST_INPUT_AUTHOR: 'input-author',
  REQUEST_INPUT_PRICE: 'input-price',
  REQUEST_INPUT_URL: 'input-url',
  NEXT: 'next',
  PREV: 'prev',
};

const SUBMISSION_TYPE_ENUM = {
  RETURN_SUBMISSION: 'return-submit',
  REQUEST_SUBMISSION: 'request-submit',
};

module.exports = {
  YN_ENUM,
  ISSUE_IMAGE_ENUM,
  REQUEST_TYPE_ENUM,
  REQUEST_STATUS_ENUM,
  ACTION_ID_ENUM,
  SUBMISSION_TYPE_ENUM,
};
