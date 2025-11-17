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
  loginOrganization,
  registerOrganization,
  listJoinRequests,
  approveJoinRequest,
  rejectJoinRequest,
  changeUserRole,
  listOrgUsers,
  removeUserFromOrg,
  generateWorksheet,
  getWorksheets,
  getWorksheet,
  createLearning,
  getLearnings,
  getLearning,
  updateLearningTitle,
  getDocumentChapters,
  getAnswerKey,
  generateLearning,
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

export const useGetDocumentChapters = (documentId, options) =>
  useQuery({
    queryKey: ["chapters", documentId],
    queryFn: () => getDocumentChapters(documentId),
    enabled: !!documentId,
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

// ==================== Organization Auth Hooks ====================
export const useLoginOrganization = (options) =>
  useMutation({
    mutationFn: loginOrganization,
    ...options,
  });

export const useRegisterOrganization = (options) =>
  useMutation({
    mutationFn: registerOrganization,
    ...options,
  });

export const useListJoinRequests = (options) =>
  useQuery({
    queryKey: ["joinRequests"],
    queryFn: listJoinRequests,
    ...options,
  });

export const useApproveJoinRequest = (options) =>
  useMutation({
    mutationFn: approveJoinRequest,
    ...options,
  });

export const useRejectJoinRequest = (options) =>
  useMutation({
    mutationFn: rejectJoinRequest,
    ...options,
  });

export const useChangeUserRole = (options) =>
  useMutation({
    mutationFn: changeUserRole,
    ...options,
  });

export const useListOrgUsers = (orgId, options) =>
  useQuery({
    queryKey: ["orgUsers", orgId],
    queryFn: () => listOrgUsers(orgId),
    enabled: !!orgId,
    ...options,
  });

export const useRemoveUserFromOrg = (options) =>
  useMutation({
    mutationFn: removeUserFromOrg,
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

// ==================== Answer Key Hooks ====================
export const useGetAnswerKey = (worksheetId, options) =>
  useQuery({
    queryKey: ["answerKey", worksheetId],
    queryFn: () => getAnswerKey(worksheetId),
    enabled: !!worksheetId,
    ...options,
  });

// ==================== Learning Hooks ====================
export const useGenerateLearning = (options) =>
  useMutation({
    mutationFn: generateLearning,
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
