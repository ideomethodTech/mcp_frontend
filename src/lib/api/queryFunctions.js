import api from "./index";
import ENDPOINTS from "./endpoints";

// Helper to get auth token
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// ==================== Authentication Functions ====================
export const loginUser = async ({ email, password }) => {
  const response = await api({
    method: "POST",
    url: ENDPOINTS.LOGIN,
    data: { email, password },
  });

  if (response.data.access_token) {
    localStorage.setItem("token", response.data.access_token);
  }

  return response.data;
};

export const registerUser = async ({ name, email, password }) => {
  const response = await api({
    method: "POST",
    url: ENDPOINTS.REGISTER,
    data: { name, email, password },
  });

  if (response.data.access_token) {
    localStorage.setItem("token", response.data.access_token);
  }

  return response.data;
};

// ==================== AI Generation Functions ====================
export const generateContent = async ({
  chat_id,
  query,
  llm_model_id,
  document_list = [],
  reranker = false,
}) => {
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

// ==================== Learning Functions ====================
export const createLearning = async ({
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
    url: ENDPOINTS.CREATE_LEARNING,
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
