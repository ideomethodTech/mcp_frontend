const ENDPOINTS = {
  // AI Generation
  GENERATE: "/generate",
  GEBERATE_WORKSHEET: "/generate/worksheet",
  GEBERATE_LESSONPLAN: "/generate/lesson_plan",
  GENERATE_ANSWER_KEY: "/generate/answer_key",

  // Book Management
  UPLOAD_BOOK: "/book/upload_book",
  GET_BOOK: "/book/get_book",

  // Chat Management
  CREATE_CHAT: "/chat/create_chat",
  GET_USER_CHATS: "/chat", // will append /{uid}
  GET_CHAT_DETAILS: "/chat", // will append /{uid}/{chat_id}

  // Worksheet Management
  GET_USER_WORKSHEET: "/worksheet/get_worksheet",

  // Lesson Plan
  GET_USER_LESSON_PLAN: "lesson_plan/get_lesson_plan",

  // Authentication
  LOGIN: "/auth/login",
  SIGNUP: "/auth/signup",
};

export default ENDPOINTS;
