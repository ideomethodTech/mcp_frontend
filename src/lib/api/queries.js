import { useQuery, useMutation } from "@tanstack/react-query";
import {
  generateContent,
  uploadDocument,
  getDocuments,
  deleteDocument,
  createChat,
  getUserChats,
  getChatMessages,
  updateChatModel,
  updateChatTitle,
  loginUser,
  registerUser,
  generateWorksheet,
  getWorksheets,
  getWorksheet,
  createLearning,
  getLearnings,
  getLearning,
  updateLearningTitle,
} from "./queryFunctions";

// ==================== AI Generation Hooks ====================
export const useGenerateContent = (options) =>
  useMutation({
    mutationFn: generateContent,
    ...options,
  });

// ==================== Document Management Hooks ====================
export const useUploadDocument = (options) =>
  useMutation({
    mutationFn: uploadDocument,
    ...options,
  });

export const useGetDocuments = (options) =>
  useQuery({
    queryKey: ["documents"],
    queryFn: getDocuments,
    ...options,
  });

export const useDeleteDocument = (options) =>
  useMutation({
    mutationFn: deleteDocument,
    ...options,
  });

// ==================== Chat Management Hooks ====================
export const useCreateChat = (options) =>
  useMutation({
    mutationFn: createChat,
    ...options,
  });

export const useGetUserChats = (options) =>
  useQuery({
    queryKey: ["chats"],
    queryFn: getUserChats,
    ...options,
  });

export const useGetChatMessages = (chatId, options) =>
  useQuery({
    queryKey: ["chatMessages", chatId],
    queryFn: () => getChatMessages(chatId),
    enabled: !!chatId,
    ...options,
  });

export const useUpdateChatModel = (options) =>
  useMutation({
    mutationFn: updateChatModel,
    ...options,
  });

export const useUpdateChatTitle = (options) =>
  useMutation({
    mutationFn: updateChatTitle,
    ...options,
  });

// ==================== Authentication Hooks ====================
export const useLogin = (options) =>
  useMutation({
    mutationFn: loginUser,
    ...options,
  });

export const useRegister = (options) =>
  useMutation({
    mutationFn: registerUser,
    ...options,
  });

// ==================== Worksheet Hooks ====================
export const useGenerateWorksheet = (options) =>
  useMutation({
    mutationFn: generateWorksheet,
    ...options,
  });

export const useGetWorksheets = (options) =>
  useQuery({
    queryKey: ["worksheets"],
    queryFn: getWorksheets,
    ...options,
  });

export const useGetWorksheet = (worksheetId, options) =>
  useQuery({
    queryKey: ["worksheet", worksheetId],
    queryFn: () => getWorksheet(worksheetId),
    enabled: !!worksheetId,
    ...options,
  });

// ==================== Learning Hooks ====================
export const useCreateLearning = (options) =>
  useMutation({
    mutationFn: createLearning,
    ...options,
  });

export const useGetLearnings = (options) =>
  useQuery({
    queryKey: ["learnings"],
    queryFn: getLearnings,
    ...options,
  });

export const useGetLearning = (learningId, options) =>
  useQuery({
    queryKey: ["learning", learningId],
    queryFn: () => getLearning(learningId),
    enabled: !!learningId,
    ...options,
  });

export const useUpdateLearningTitle = (options) =>
  useMutation({
    mutationFn: updateLearningTitle,
    ...options,
  });
