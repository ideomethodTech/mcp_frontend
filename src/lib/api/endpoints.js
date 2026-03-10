const ENDPOINTS = {
  // AI Generation
  GENERATE: "/generate/",
  GENERATE_WORKSHEET: "/generate/worksheet/",
  GENERATE_LESSON_PLAN: "/generate/lesson_plan/",
  GENERATE_ANSWER_KEY: "/generate/answer_key/",
  GENERATE_TEST_PAPER: "/api/test_paper/generate/",

  // Book Management
  // UPLOAD_BOOK: "/upload/book/",
  UPLOAD_BOOK: "/book/upload_book",
  GET_BOOK: "/book/get_book/",
  DELETE_BOOK: "/book/", // DELETE /book/{uid}/{book_id}

  // Chat Management
  CREATE_CHAT: "/chat/create_chat/",
  GET_USER_CHATS: "/chat/", // will append /{uid}
  GET_CHAT_DETAILS: "/chat/", // will append /{uid}/{chat_id}
  DELETE_CHAT: "/chat/", // DELETE /chat/{uid}/{chat_id}
  DELETE_CHAT_MESSAGE: "/chat/message/", // DELETE /chat/message/{uid}/{message_id}

  // Worksheet Management
  GET_USER_WORKSHEET: "/worksheet/get_worksheet/",
  DELETE_WORKSHEET: "/worksheet/", // DELETE /worksheet/{uid}/{worksheet_id}

  // Lesson Plan
  GET_USER_LESSON_PLAN: "/lesson_plan/get_lesson_plan/",
  DELETE_LESSON_PLAN: "/lesson_plan/", // DELETE /lesson_plan/{uid}/{lesson_plan_id}

  // Answer key
  GET_USER_ANSWER_KEY: "/generate/answer_key/get/",
  DELETE_ANSWER_KEY: "/generate/answer_key/", // DELETE /generate/answer_key/{uid}/{answer_key_id}

  // Test Paper Management
  GET_ALL_TEST_PAPERS: "/api/test_paper/list/",
  GET_TEST_PAPER: "/api/test_paper/get/",
  GET_TEST_PAPER_ANSWERS: "/api/test_paper/answers/",
  DELETE_TEST_PAPER: "/api/test_paper/", // DELETE /api/test_paper/{uid}/{test_paper_id}
  TEST_PAPER_TEST: "/api/test_paper/test/",

  // Authentication
  LOGIN: "/auth/login",
  SIGNUP: "/auth/signup",
};

export default ENDPOINTS;
