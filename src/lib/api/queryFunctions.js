import api from "./index";
import ENDPOINTS from "./endpoints";

// AI Generation Functions
export const generateContent = async ({ chat_id, uid, prompt }) => {
  const response = await api({
    url: ENDPOINTS.GENERATE,
    method: "POST",
    data: { chat_id, uid, prompt },
  });
  return response.data;
};

export const generateWorksheet = async ({ book_id, uid, chapter }) => {
  const response = await api({
    url: ENDPOINTS.GEBERATE_WORKSHEET,
    method: "POST",
    data: { book_id, uid, chapter },
  });
  return response.data;
};

export const generateAnswerKey = async ({ worksheet_id, book_id, uid, chapter }) => {
  const response = await api({
    url: ENDPOINTS.GENERATE_ANSWER_KEY,
    method: "POST",
    data: { worksheet_id, book_id, uid, chapter },
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
      uid: data.uid,
    },
  });
  return response.data;
};

export const getBooks = async (uid = null) => {
  const response = await api({
    url: ENDPOINTS.GET_BOOK,
    method: "GET",
    params: uid ? { uid } : {},
  });
  return response.data;
};

//Worksheet
export const createWorksheet = async (data) => {
  const response = await api({
    url: ENDPOINTS.GEBERATE_WORKSHEET,
    method: "POST",
    data: {
      book_id: data.book_id,
      chapter: data.chapter,
      uid: data.uid,
    },
  });
  return response.data;
};

export const getWorksheet = async (uid) => {
  if (!uid) throw new Error("User ID is required");

  const response = await api({
    url: ENDPOINTS.GET_USER_WORKSHEET,
    method: "GET",
    params: { uid }, // ✅ Correct way to pass query params
  });

  return response.data;
};

export const getAnswerKey = async (answerKeyId, uid) => {
  if (!answerKeyId) return null; // ✅ SAFE

  const response = await api({
    url: ENDPOINTS.GET_USER_ANSWER_KEY,
    method: "GET",
    params: {
      answerKeyId,
      uid,
    },
  });

  return response.data;
};

export const getAllAnswerKeys = async (uid) => {
  if (!uid) return null;

  const response = await api({
    url: ENDPOINTS.GET_USER_ANSWER_KEY,
    method: "GET",
    params: { uid },
  });

  return response.data;
};

// lesson plan
export const createLessonPlan = async (data) => {
  const response = await api({
    url: ENDPOINTS.GEBERATE_LESSONPLAN,
    method: "POST",
    data: {
      book_id: data.book_id,
      chapter: data.chapter,
      uid: data.uid,
      weeks: data.weeks,
    },
  });
  return response.data;
};

export const getLessonPlan = async (uid) => {
  if (!uid) throw new Error("User ID is required");

  const response = await api({
    url: ENDPOINTS.GET_USER_LESSON_PLAN,
    method: "GET",
    params: { uid }, // ✅ Correct way to pass query params
  });

  return response.data;
};

// Chat Management Functions
export const createChat = async (data) => {
  const response = await api({
    url: ENDPOINTS.CREATE_CHAT,
    method: "POST",
    data: {
      chat_title: data.chat_title,
      uid: data.uid,
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
  // if (!uid || !chatId) throw new Error("User ID and Chat ID are required");
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
      email: data.email,
      password: data.password,
    },
  });
  return response.data;
};

export const registerUser = async (data) => {
  const response = await api({
    url: ENDPOINTS.SIGNUP,
    method: "POST",
    data: {
      email: data.email,
      password: data.password,
      username: data.username,
      role: "user",
      profile_details: {},
    },
  });
  return response.data;
};
