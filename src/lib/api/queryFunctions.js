import api from "./index";
import ENDPOINTS from "./endpoints";

// AI Generation Functions
export const generateContent = async (data) => {
  const response = await api({
    url: ENDPOINTS.GENERATE,
    method: "POST",
    data: {
      book_id: data.book_id || "",
      chat_id: data.chat_id || "",
      uid: data.uid || "",
      prompt: data.prompt || ""
    },
  });
  return response.data;
};

// Book Management Functions
export const uploadBook = async (data) => {
  const response = await api({
    url: ENDPOINTS.UPLOAD_BOOK,
    method: "POST",
    data: {
      book_url: data.book_url,
      book_name: data.book_name,
      uid: data.uid
    },
  });
  return response.data;
};

export const getBook = async (data) => {
  const response = await api({
    url: ENDPOINTS.GET_BOOK,
    method: "POST",
    data: {
      book_url: data.book_url,
      book_name: data.book_name,
      uid: data.uid
    },
  });
  return response.data;
};

// Chat Management Functions
export const createChat = async (data) => {
  const response = await api({
    url: ENDPOINTS.CREATE_CHAT,
    method: "POST",
    data: {
      chat_id: data.chat_id || "",
      chat_title: data.chat_title,
      uid: data.uid
    },
  });
  return response.data;
};

export const getUserChats = async (uid) => {
  if (!uid) throw new Error("User ID is required");
  const response = await api({
    url: `${ENDPOINTS.GET_USER_CHATS}/${uid}`,
    method: "GET",
  });
  return response.data;
};

export const getChatDetails = async (uid, chatId) => {
  if (!uid || !chatId) throw new Error("User ID and Chat ID are required");
  const response = await api({
    url: `${ENDPOINTS.GET_CHAT_DETAILS}/${uid}/${chatId}`,
    method: "GET",
  });
  return response.data;
};

// Authentication Functions
export const loginUser = async (data) => {
  const response = await api({
    url: ENDPOINTS.LOGIN,
    method: "POST",
    data: {
      role: data.role,
      uid: data.uid || "",
      email: data.email,
      username: data.username,
      access_token: data.access_token || "",
      refresh_token: data.refresh_token || "",
      profile_details: data.profile_details || {}
    },
  });
  return response.data;
};