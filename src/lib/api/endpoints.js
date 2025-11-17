const ENDPOINTS = {
  LOGIN_ORG:"/login-org",
  REGISTER_ORG:"/register-org",
  LIST_JOIN_REQUESTS: "/org/list-join-requests",
  APPROVE_JOIN_REQUEST: "/org/approve-join-request",
  REJECT_JOIN_REQUEST: "/reject-join-request",
  CHANGE_USER_ROLE: "/org/change-role",
  LIST_ORG_USERS: "/org", // + /{org_id}/users
  REMOVE_USER_FROM_ORG: "/org/user", // + /{user_id}

  // AI Generation
  GENERATE: "/generate",

  // Document Management
  UPLOAD_DOCUMENT: "/upload-document",
  GET_DOCUMENTS: "/get-documents",
  DELETE_DOCUMENT: "/delete-document", // + /{document_id}

  // Chat Management
  CREATE_CHAT: "/create-chat",
  LIST_CHATS: "/list-chats",
  GET_MESSAGES: "/get-messages", // + /{chat_id}
  UPDATE_CHAT_MODEL: "/chat/update-model",
  UPDATE_CHAT_TITLE: "/chat/update-title",

  // Worksheet Management
  GENERATE_WORKSHEET: "/generate-worksheet",
  GET_WORKSHEETS: "/get-worksheets",
  GET_WORKSHEET: "/get-worksheet", // + /{worksheet_id}

  // Learning Management
  CREATE_LEARNING: "/create-learning",
  GET_LEARNINGS: "/get-learnings",
  GET_LEARNING: "/get-learning", // + /{learning_id}
  UPDATE_LEARNING_TITLE: "/learning/update-title",
};

export default ENDPOINTS;
