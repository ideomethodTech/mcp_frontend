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
} from "./queryFunctions";

// AI Generation Hooks
export const useGenerateContent = (options) =>
  useMutation({
    mutationFn: ({ chat_id, uid, prompt }) => generateContent({ chat_id, uid, prompt }),
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
