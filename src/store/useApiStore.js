import { create } from "zustand";

const useApiStore = create((set) => ({
  lessonPlanStatus: "idle",
  chatStatus: "idle",
  worksheetStatus: "idle",
  answerKeyStatus: "idle",
  testPaperStatus: "idle",
  deletedIds: [],

  setLessonPlanStatus: (status) => set({ lessonPlanStatus: status }),
  setChatStatus: (status) => set({ chatStatus: status }),
  setWorksheetStatus: (status) => set({ worksheetStatus: status }),
  setAnswerKeyStatus: (status) => set({ answerKeyStatus: status }),
  setTestPaperStatus: (status) => set({ testPaperStatus: status }),
  
  addDeletedId: (id) => set((state) => ({ 
    deletedIds: [...state.deletedIds, String(id)] 
  })),

  resetAll: () =>
    set({
      lessonPlanStatus: "idle",
      chatStatus: "idle",
      worksheetStatus: "idle",
      answerKeyStatus: "idle",
      testPaperStatus: "idle",
      deletedIds: [],
    }),
}));

export default useApiStore;
