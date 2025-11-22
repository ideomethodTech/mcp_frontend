const ENDPOINTS = {
  // AI Generation
  GENERATE: "/generate",
  GEBERATE_WORKSHEET: "/generate/worksheet",
  GEBERATE_LESSONPLAN: "/generate/lesson_plan",
  
  // Book Management
  UPLOAD_BOOK: "/book/upload_book",
  GET_BOOK: "/book/get_book",
  
  // Chat Management
  CREATE_CHAT: "/chat/create_chat",
  GET_USER_CHATS: "/chat", // will append /{uid}
  GET_CHAT_DETAILS: "/chat", // will append /{uid}/{chat_id}
  
  // Authentication
  LOGIN: "/auth/login",
};

export default ENDPOINTS;