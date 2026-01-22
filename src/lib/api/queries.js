import { useQuery, useMutation } from "@tanstack/react-query";
import {
  generateContent,
  uploadBook,
  getBooks,
  createChat,
  getUserChats,
  getChatDetails,
  loginUser,
  createWorksheet,
  createLessonPlan,
  generateWorksheet,
  generateAnswerKey,
  getLessonPlan,
  getWorksheet,
  registerUser,
  getAnswerKey,
  getAllAnswerKeys,
  generateTestPaper,
  getTestPaper,
  getAllTestPapers,
  getTestPaperAnswers,
  testTestPaperAPI,
  deleteWorksheet,
  deleteLessonPlan,
  deleteChat,
  deleteChatMessage,
  deleteAnswerKey,
} from "./queryFunctions";

// AI Generation Hooks
export const useGenerateContent = (options) =>
  useMutation({
    mutationFn: ({ chat_id, uid, prompt, book_id }) => generateContent({ chat_id, uid, prompt, book_id }),
    ...options,
  });

export const useGenerateWorksheet = (options) =>
  useMutation({
    mutationFn: ({ book_id, uid, chapter }) => generateWorksheet({ book_id, uid, chapter }),
    ...options,
  });

export const useGenerateAnswerKey = (options) =>
  useMutation({
    mutationFn: ({ worksheet_id, book_id, uid, chapter }) => generateAnswerKey({ worksheet_id, book_id, uid, chapter }),
    ...options,
  });

// Book Management Hooks
export const useUploadBook = (options) =>
  useMutation({
    mutationFn: uploadBook,
    ...options,
  });

export const useGetBook = (options = {}) =>
  useQuery({
    queryKey: ["books"],
    queryFn: () => getBooks(),
    enabled: true,

    ...options,
  });

//worksheet
export const useCreateWorksheet = (options) =>
  useMutation({
    mutationFn: createWorksheet,
    ...options,
  });

export const useDeleteWorksheet = (options) =>
  useMutation({
    mutationFn: deleteWorksheet,
    ...options,
  });

export const useUserWorksheet = (uid, options = {}) =>
  useQuery({
    queryKey: ["ws", uid],
    queryFn: () => getWorksheet(uid),
    enabled: true,
    ...options,
    staleTime: 0,
  });

export const useGetAnswerKeyById = (answerKeyId, uid, options = {}) =>
  useQuery({
    queryKey: ["answer-key", answerKeyId, uid],
    queryFn: () => getAnswerKey(answerKeyId, uid), // ✅ Pass uid here!
    enabled: !!answerKeyId && !!uid,
    ...options,
  });

export const useGetAllAnswerKeys = (uid, options = {}) =>
  useQuery({
    queryKey: ["all-answer-keys", uid],
    queryFn: () => getAllAnswerKeys(uid),
    enabled: !!uid, // ✅ only when user is logged in
    ...options,
  });

// Lesson Plan
export const useCreateLessonPlan = (options) =>
  useMutation({
    mutationFn: createLessonPlan,
    ...options,
  });

export const useDeleteLessonPlan = (options) =>
  useMutation({
    mutationFn: deleteLessonPlan,
    ...options,
  });

export const useUserLessonPlan = (uid, options = {}) =>
  useQuery({
    queryKey: ["lp", uid],
    queryFn: () => getLessonPlan(uid),
    enabled: true,
    ...options,
    staleTime: 0,
  });

// Chat Management Hooks
export const useCreateChat = (options) =>
  useMutation({
    mutationFn: createChat,
    ...options,
  });

export const useDeleteChat = (options) =>
  useMutation({
    mutationFn: deleteChat,
    ...options,
  });

export const useDeleteChatMessage = (options) =>
  useMutation({
    mutationFn: deleteChatMessage,
    ...options,
  });

export const useDeleteAnswerKey = (options) =>
  useMutation({
    mutationFn: deleteAnswerKey,
    ...options,
  });

export const useUserChats = (uid, options) =>
  useQuery({
    queryKey: ["userChats", uid],
    queryFn: () => getUserChats(uid),
    enabled: !!uid,
    staleTime: 0,
    ...options,
  });

export const useChatDetails = (uid, chatId, options) =>
  useQuery({
    queryKey: ["chatDetails", uid, chatId],
    queryFn: () => getChatDetails(uid, chatId),
    enabled: Boolean(uid && chatId),
    ...options,
    staleTime: 0,
  });

// Authentication Hooks
export const useRegister = (options) =>
  useMutation({
    mutationFn: registerUser,
    ...options,
  });

export const useLogin = (options) =>
  useMutation({
    mutationFn: loginUser,
    ...options,
  });

// Lesson Plan Hooks
export const useGetLessonPlans = (uid, options = {}) =>
  useQuery({
    queryKey: ["lessonPlans", uid],
    queryFn: () => getLessonPlan(uid),
    enabled: !!uid,
    ...options,
  });

export const useGenerateTestPaper = (options) =>
  useMutation({
    mutationFn: ({ uid, book_id, chapter, class: className, subject, total_marks, duration }) =>
      generateTestPaper({ uid, book_id, chapter, class: className, subject, total_marks, duration }),
    ...options,
  });

export const useUserTestPapers = (uid, options = {}) =>
  useQuery({
    queryKey: ["test-papers", uid],
    queryFn: () => getAllTestPapers(uid),
    enabled: !!uid,
    staleTime: 0,
    ...options,
  });

export const useGetTestPaperById = (testPaperId, uid, options = {}) =>
  useQuery({
    queryKey: ["test-paper", testPaperId, uid],
    queryFn: () => getTestPaper(testPaperId, uid),
    enabled: !!testPaperId && !!uid,
    ...options,
  });

export const useGetTestPaperAnswers = (testPaperId, uid, options = {}) =>
  useQuery({
    queryKey: ["test-paper-answers", testPaperId, uid],
    queryFn: () => getTestPaperAnswers(testPaperId, uid),
    enabled: !!testPaperId && !!uid,
    ...options,
  });

export const useTestPaperAPITest = (options = {}) =>
  useQuery({
    queryKey: ["test-paper-api-test"],
    queryFn: testTestPaperAPI,
    ...options,
  });
