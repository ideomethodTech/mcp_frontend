import { useQuery, useMutation } from "@tanstack/react-query";
import {
  generateContent,
  uploadBook,
  getBook,
  createChat,
  getUserChats,
  getChatDetails,
  loginUser,
} from "./queryFunctions";

// AI Generation Hooks
export const useGenerateContent = (options) =>
  useMutation({
    mutationFn: generateContent,
    ...options,
  });

// Book Management Hooks
export const useUploadBook = (options) =>
  useMutation({
    mutationFn: uploadBook,
    ...options,
  });

export const useGetBook = (options) =>
  useMutation({
    mutationFn: getBook,
    ...options,
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
    ...options,
  });

export const useChatDetails = (uid, chatId, options) =>
  useQuery({
    queryKey: ["chatDetails", uid, chatId],
    queryFn: () => getChatDetails(uid, chatId),
    enabled: !!uid && !!chatId,
    ...options,
  });

// Authentication Hooks
export const useLogin = (options) =>
  useMutation({
    mutationFn: loginUser,
    ...options,
  });