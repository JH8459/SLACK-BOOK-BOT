const express = require('express');
const dotenv = require('dotenv').config();
const { Client } = require('@notionhq/client');
const { VerificationNotionCategoryList, VerificationNotionBookList } = require('./util/verification');

// 노션 클라이언트
const notionClient = new Client({
  auth: process.env.NOTION_KEY,
});
// 노션 DB 저장소 ID
const bookListNotionId = process.env.NOTION_BOOK_LIST;

// NOTION DB 저장소에 존재하는 카테고리를 가져오는 함수
exports.getCategoryList = async () => {
  // 도서 리스트를 담을 변수
  let results = [];
  // 노션에서 도서 리스트를 가져온다.
  const bookList = await notionClient.databases.query({
    database_id: bookListNotionId,
  });
  // 도서 리스트
  results = [...bookList.results];
  // 100개 이상인 경우 리스트 연장
  while (bookList.has_more) {
    const nextBookList = await notionClient.databases.query({
      database_id: bookListNotionId,
      start_cursor: bookList.next_cursor,
    });
    results = [...results, ...nextBookList.results];
  }
  // 데이터 전처리
  const verificationCategoryList = VerificationNotionCategoryList(results);
  // 중복제거
  const uniqueCategoryList = verificationCategoryList.filter(
    (category, idx) => verificationCategoryList.indexOf(category) === idx,
  );

  return uniqueCategoryList;
};

// NOTION DB 저장소에 존재하는 장르 별 도서 목록을 가져오는 함수
exports.getBookListGroupByGenre = async (genre) => {
  // 도서 리스트를 담을 변수
  let results = [];
  // 정렬 옵션
  const orderBy = [
    {
      property: '도서명',
      direction: 'ascending',
    },
  ];
  // 필터 옵션
  const filter = {
    property: '장르',
    select: {
      equals: genre,
    },
  };
  // 노션에서 도서 리스트를 가져온다.
  const bookList = await notionClient.databases.query({
    database_id: bookListNotionId,
    sorts: orderBy, // 정렬
    filter, // 장르
  });
  // 도서 리스트
  results = [...bookList.results];
  // 100개 이상인 경우 리스트 연장
  while (bookList.has_more) {
    const nextBookList = await notionClient.databases.query({
      database_id: bookListDatabaseId,
      sorts: orderBy, // 정렬
      filter,
      start_cursor: bookList.next_cursor,
    });
    results = [...results, ...nextBookList.results];
  }
  // 데이터 전처리
  const verificationBookList = VerificationNotionBookList(results);

  return verificationBookList;
};
