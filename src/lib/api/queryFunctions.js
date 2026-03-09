import axios from "axios";
import api from "./index";
import ENDPOINTS from "./endpoints";

// AI Generation Functions
export const generateContent = async ({ uid, prompt, book_id, chat_id }) => {
  console.log("SENDING CHAT REQUEST:", { uid, prompt, book_id, chat_id });
  const response = await api({
    url: ENDPOINTS.GENERATE,
    method: "POST",
    data: { uid, prompt, book_id, chat_id },
    timeout: 300000,
  });
  return response.data;
};

export const generateWorksheet = async (data) => {
  const response = await api({
    url: ENDPOINTS.GENERATE_WORKSHEET,
    method: "POST",
    data: {
      uid: data.uid,
      book_id: data.book_id,
      chapter: data.chapter,
      prompt: `Generate a worksheet based on chapter: ${data.chapter}.`,
      subject: data.subject || null,
      class: data.class || null,
    },
    timeout: 300000,
  });
  return response.data;
};

export const generateAnswerKey = async (data) => {
  const response = await api({
    url: ENDPOINTS.GENERATE_ANSWER_KEY,
    method: "POST",
    data: {
      worksheet_id: data.worksheet_id,
      book_id: data.book_id,
      uid: data.uid,
      chapter: data.chapter,
      prompt: `Generate an answer key for chapter: ${data.chapter}.`,
      subject: data.subject || null,
      class: data.class || null,
    },
    timeout: 300000,
  });
  return response.data;
};

// Book Management Functions
export const uploadBook = async (formData, onUploadProgress) => {
  console.log("--- Uploading Book Debug ---");
  for (let [key, value] of formData.entries()) {
    console.log(`${key}:`, value instanceof File ? `File(${value.name})` : value);
  }

  const baseURL = process.env.NEXT_PUBLIC_API_URL;
  const token = localStorage.getItem("access_token");

  // Using axios directly to ensure browsers handle the boundary correctly
  const response = await axios({
    url: `${baseURL}${ENDPOINTS.UPLOAD_BOOK}`,
    method: "POST",
    data: formData,
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
      // Do NOT set Content-Type, let axios/browser handle it
    },
    onUploadProgress,
  });

  console.log("Upload Response:", response.data);
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

export const deleteBook = async ({ uid, book_id }) => {
  if (!uid || !book_id) throw new Error("uid and book_id are required");
  const response = await api({
    url: `${ENDPOINTS.DELETE_BOOK}${uid}/${book_id}`,
    method: "DELETE",
  });
  return response.data;
};

//Worksheet
export const createWorksheet = async (data) => {
  const response = await api({
    url: ENDPOINTS.GENERATE_WORKSHEET,
    method: "POST",
    data: {
      book_id: data.book_id,
      prompt: data.chapter,
      uid: data.uid,
    },
    timeout: 300000,
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

export const deleteWorksheet = async ({ uid, worksheet_id }) => {
  if (!uid || !worksheet_id) throw new Error("uid and worksheet_id are required");
  const response = await api({
    url: `${ENDPOINTS.DELETE_WORKSHEET}${uid}/${worksheet_id}`,
    method: "DELETE",
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
  console.log("API createLessonPlan Payload:", data);
  const response = await api({
    url: ENDPOINTS.GENERATE_LESSON_PLAN,
    method: "POST",
    data: {
      uid: data.uid,
      book_id: data.book_id,
      chapter: data.chapter, // Ensure 'chapter' is sent directly
      prompt: `Generate a detailed lesson plan for chapter: ${data.chapter}.`,
      weeks: data.weeks,
      // Pass-through any other fields likes subject or class if they were sent
      subject: data.subject || null,
      class: data.class || null,
    },
    timeout: 300000,
  });
  return response.data;
};

export const getLessonPlan = async (uid) => {
  if (!uid) throw new Error("User ID is required");

  const response = await api({
    url: ENDPOINTS.GET_USER_LESSON_PLAN,
    method: "GET",
    params: { uid },
  });

  return response.data;
};

export const deleteLessonPlan = async ({ uid, lesson_plan_id, lessonPlanId }) => {
  const actualLessonPlanId = lesson_plan_id || lessonPlanId;
  let actualUid = uid;

  if (!actualUid && typeof window !== 'undefined') {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        actualUid = parsed?.user?.uid || parsed?.uid;
      }
    } catch (e) {
      console.error("Error retrieving uid from localStorage", e);
    }
  }

  if (!actualUid || !actualLessonPlanId) throw new Error("uid and lesson_plan_id are required");

  // Remove trailing slash to prevent CORS issues if endpoint has one (failsafe)
  const endpoint = ENDPOINTS.DELETE_LESSON_PLAN.endsWith('/')
    ? ENDPOINTS.DELETE_LESSON_PLAN.slice(0, -1)
    : ENDPOINTS.DELETE_LESSON_PLAN;

  const response = await api({
    url: `${endpoint}/${actualUid}/${actualLessonPlanId}`,
    method: "DELETE",
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
      book_id: data.book_id,
    },
  });
  return response.data;
};

export const getUserChats = async (uid) => {
  if (!uid) throw new Error("User ID is required");
  const response = await api({
    url: `${ENDPOINTS.GET_USER_CHATS}${uid}`,
    method: "GET",
  });
  return response.data;
};

export const getChatDetails = async (uid, chatId) => {
  // if (!uid || !chatId) throw new Error("User ID and Chat ID are required");
  const response = await api({
    url: `${ENDPOINTS.GET_CHAT_DETAILS}${uid}/${chatId}`,
    method: "GET",
  });
  return response.data;
};

export const deleteChat = async ({ uid, chatId }) => {
  if (!uid || !chatId) throw new Error("User ID and Chat ID are required");
  const response = await api({
    url: `${ENDPOINTS.DELETE_CHAT}${uid}/${chatId}`,
    method: "DELETE",
  });
  return response.data;
};

export const deleteChatMessage = async ({ uid, message_id }) => {
  if (!uid || !message_id) throw new Error("uid and message_id are required");
  const response = await api({
    url: `${ENDPOINTS.DELETE_CHAT_MESSAGE}${uid}/${message_id}`,
    method: "DELETE",
  });
  return response.data;
};

export const deleteAnswerKey = async ({ uid, answer_key_id }) => {
  if (!uid || !answer_key_id) throw new Error("uid and answer_key_id are required");
  const response = await api({
    url: `${ENDPOINTS.DELETE_ANSWER_KEY}${uid}/${answer_key_id}`,
    method: "DELETE",
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
    headers: {
      "Content-Type": "application/json",
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
    headers: {
      "Content-Type": "application/json",
    },
  });
  return response.data;
};

export const generateTestPaper = async (data) => {
  const response = await api({
    url: ENDPOINTS.GENERATE_TEST_PAPER,
    method: "POST",
    data: {
      uid: data.uid,
      book_id: data.book_id,
      chapter: data.chapter,
      prompt: `Generate a ${data.subject} test paper based on chapter: ${data.chapter}. Ensure questions are specific to this subject and chapter context.`,
      class: data.class,
      subject: data.subject,
      total_marks: data.total_marks,
      duration: data.duration,
    },
    timeout: 300000,
  });
  return response.data;
};

export const getAllTestPapers = async (uid) => {
  if (!uid) throw new Error("User ID is required");

  const response = await api({
    url: ENDPOINTS.GET_ALL_TEST_PAPERS,
    method: "GET",
    params: { uid },
  });
  return response.data;
};

export const getTestPaper = async (testPaperId, uid) => {
  if (!testPaperId || !uid) throw new Error("Test Paper ID and User ID are required");

  const response = await api({
    url: ENDPOINTS.GET_TEST_PAPER,
    method: "GET",
    params: {
      paper_id: testPaperId,
      uid,
    },
  });
  return response.data;
};

export const getTestPaperAnswers = async (testPaperId, uid) => {
  if (!testPaperId || !uid) throw new Error("Test Paper ID and User ID are required");

  const response = await api({
    url: ENDPOINTS.GET_TEST_PAPER_ANSWERS,
    method: "GET",
    params: {
      paper_id: testPaperId,
      uid,
    },
  });
  return response.data;
};

export const deleteTestPaper = async ({ uid, test_paper_id }) => {
  if (!uid || !test_paper_id) throw new Error("uid and test_paper_id are required");
  const response = await api({
    url: `${ENDPOINTS.DELETE_TEST_PAPER}${uid}/${test_paper_id}`,
    method: "DELETE",
  });
  return response.data;
};

// Test endpoint to verify test paper routes are working
export const testTestPaperAPI = async () => {
  const response = await api({
    url: ENDPOINTS.TEST_PAPER_TEST,
    method: "GET",
  });
  return response.data;
};
