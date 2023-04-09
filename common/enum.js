const YN_ENUM = {
  YES: 'Y',
  NO: 'N',
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
  RETURN_DATE: 'return-date',
  RENT: 'rent',
  MODAL: 'modal',
  REPLY: 'reply',
  REQUEST_INPUT_PURPOSE: 'input-purpose',
  REQUEST_INPUT_PURPOSE: 'input-title',
  REQUEST_INPUT_AUTHOR: 'input-author',
  REQUEST_INPUT_PRICE: 'input-price',
  REQUEST_INPUT_URL: 'input-url',
};

const SUBMISSION_TYPE_ENUM = {
  RETURN_SUBMISSION: 'return-submit',
  REQUEST_SUBMISSION: 'request-submit',
};

module.exports = {
  YN_ENUM,
  REQUEST_TYPE_ENUM,
  REQUEST_STATUS_ENUM,
  ACTION_ID_ENUM,
  SUBMISSION_TYPE_ENUM,
};
