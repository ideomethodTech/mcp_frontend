import api from "./index";
import ENDPOINTS from "./endpoints";

// Helper to get auth token
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// ==================== Organization Auth Functions ====================
export const loginOrganization = async ({ org_name, email, name, password }) => {
  const response = await api({
    method: "POST",
    url: ENDPOINTS.LOGIN_ORG,
    data: { org_name, email, name, password },
  });

  if (response.data.token) {
    localStorage.setItem("token", response.data.token);
  }

  // CHANGE THIS: Use the form values since API doesn't return user data
  const userData = {
    name: name,
    email: email,
    org_name: org_name,
    role: response.data.role || "admin",
  };
  localStorage.setItem("user", JSON.stringify(userData));

  return response.data;
};

export const registerOrganization = async ({ name, org_name, email, password }) => {
  const response = await api({
    method: "POST",
    url: ENDPOINTS.REGISTER_ORG,
    data: { name, org_name, email, password },
  });

  if (response.data.token) {
    localStorage.setItem("token", response.data.token);
  }

  // CHANGE THIS: Use the form values since API doesn't return user data
  const userData = {
    name: name,
    email: email,
    org_name: org_name,
    role: response.data.role || "admin",
  };
  localStorage.setItem("user", JSON.stringify(userData));

  return response.data;
};

export const listJoinRequests = async () => {
  const response = await api({
    method: "GET",
    url: ENDPOINTS.LIST_JOIN_REQUESTS,
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const approveJoinRequest = async ({ target_user_id }) => {
  const response = await api({
    method: "POST",
    url: ENDPOINTS.APPROVE_JOIN_REQUEST,
    headers: getAuthHeaders(),
    data: { target_user_id },
  });
  return response.data;
};

export const rejectJoinRequest = async ({ target_user_id }) => {
  const response = await api({
    method: "POST",
    url: ENDPOINTS.REJECT_JOIN_REQUEST,
    headers: getAuthHeaders(),
    data: { target_user_id },
  });
  return response.data;
};

export const changeUserRole = async ({ target_user_id, role }) => {
  const response = await api({
    method: "POST",
    url: ENDPOINTS.CHANGE_USER_ROLE,
    headers: getAuthHeaders(),
    data: { target_user_id, role },
  });
  return response.data;
};

export const listOrgUsers = async (org_id) => {
  const response = await api({
    method: "GET",
    url: `${ENDPOINTS.LIST_ORG_USERS}/${org_id}/users`,
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const removeUserFromOrg = async (user_id) => {
  const response = await api({
    method: "DELETE",
    url: `${ENDPOINTS.REMOVE_USER_FROM_ORG}/${user_id}`,
    headers: getAuthHeaders(),
  });
  return response.data;
};

// ==================== AI Generation Functions ====================
export const generateContent = async ({ chat_id, query, llm_model_id, document_list = [], reranker = false }) => {
  const response = await api({
    method: "POST",
    url: ENDPOINTS.GENERATE,
    headers: getAuthHeaders(),
    data: {
      chat_id,
      query,
      llm_model_id,
      ...(document_list.length > 0 && { document_list }),
      reranker,
    },
  });
  return response.data;
};

// ==================== Document Management Functions ====================
export const uploadDocument = async (files) => {
  const formData = new FormData();

  // Handle single or multiple files
  if (Array.isArray(files)) {
    files.forEach((file) => formData.append("files", file));
  } else {
    formData.append("files", files);
  }

  const response = await api({
    method: "POST",
    url: ENDPOINTS.UPLOAD_DOCUMENT,
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "multipart/form-data",
    },
    data: formData,
  });
  return response.data;
};

export const getDocuments = async () => {
  const response = await api({
    method: "GET",
    url: ENDPOINTS.GET_DOCUMENTS,
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const deleteDocument = async (document_id) => {
  const response = await api({
    method: "DELETE",
    url: `${ENDPOINTS.DELETE_DOCUMENT}/${document_id}`,
    headers: getAuthHeaders(),
  });
  return response.data;
};

// ==================== Chapter Functions ====================
export const getDocumentChapters = async (document_id) => {
  const response = await api({
    method: "GET",
    url: `${ENDPOINTS.GET_CHAPTERS}/${document_id}`,
    headers: getAuthHeaders(),
  });
  return response.data;
};

// ==================== Chat Management Functions ====================
export const createChat = async ({ title, llm_model_id }) => {
  const response = await api({
    method: "POST",
    url: ENDPOINTS.CREATE_CHAT,
    headers: getAuthHeaders(),
    data: { title, llm_model_id },
  });
  return response.data;
};

export const getUserChats = async () => {
  const response = await api({
    method: "GET",
    url: ENDPOINTS.LIST_CHATS,
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const getChatMessages = async (chat_id) => {
  const response = await api({
    method: "GET",
    url: `${ENDPOINTS.GET_MESSAGES}/${chat_id}`,
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const updateChatModel = async ({ chat_id, new_llm_model_id }) => {
  const response = await api({
    method: "PUT",
    url: ENDPOINTS.UPDATE_CHAT_MODEL,
    headers: getAuthHeaders(),
    data: { chat_id, new_llm_model_id },
  });
  return response.data;
};

export const updateChatTitle = async ({ chat_id, new_title }) => {
  const response = await api({
    method: "POST",
    url: ENDPOINTS.UPDATE_CHAT_TITLE,
    headers: getAuthHeaders(),
    data: { chat_id, new_title },
  });
  return response.data;
};

// ==================== Worksheet Functions ====================
export const generateWorksheet = async ({
  document_id,
  chapter_id,
  difficulty,
  mcq_num,
  fill_ups_num,
  brief_qa_num,
  true_false_num,
  match_following_num,
}) => {
  const response = await api({
    method: "POST",
    url: ENDPOINTS.GENERATE_WORKSHEET,
    headers: getAuthHeaders(),
    data: {
      document_id,
      chapter_id,
      difficulty,
      mcq_num,
      fill_ups_num,
      brief_qa_num,
      true_false_num,
      match_following_num,
    },
  });
  return response.data;
};

export const getWorksheets = async () => {
  const response = await api({
    method: "GET",
    url: ENDPOINTS.GET_WORKSHEETS,
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const getWorksheet = async (worksheet_id) => {
  const response = await api({
    method: "GET",
    url: `${ENDPOINTS.GET_WORKSHEET}/${worksheet_id}`,
    headers: getAuthHeaders(),
  });
  return response.data;
};

// ==================== Answer Key Functions ====================
export const getAnswerKey = async (worksheet_id) => {
  const response = await api({
    method: "GET",
    url: `${ENDPOINTS.GET_ANSWER_KEY}/${worksheet_id}`,
    headers: getAuthHeaders(),
  });
  return response.data;
};

// ==================== Learning Functions ====================
export const generateLearning = async ({ document_id, chapter_id }) => {
  const response = await api({
    method: "POST",
    url: ENDPOINTS.GENERATE_LEARNING,
    headers: getAuthHeaders(),
    data: { document_id, chapter_id },
  });
  return response.data;
};

export const getLearnings = async () => {
  const response = await api({
    method: "GET",
    url: ENDPOINTS.GET_LEARNINGS,
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const getLearning = async (learning_id) => {
  const response = await api({
    method: "GET",
    url: `${ENDPOINTS.GET_LEARNING}/${learning_id}`,
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const updateLearningTitle = async ({ learning_id, new_title }) => {
  const response = await api({
    method: "POST",
    url: ENDPOINTS.UPDATE_LEARNING_TITLE,
    headers: getAuthHeaders(),
    data: { learning_id, new_title },
  });
  return response.data;
};
