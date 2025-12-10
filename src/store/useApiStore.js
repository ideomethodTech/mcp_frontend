import { create } from "zustand";

const useApiStore = create((set) => ({
  lessonPlanStatus: "idle",
  chatStatus: "idle",
  worksheetStatus: "idle",
  answerKeyStatus: "idle",
  testPaperStatus: "idle",

  setLessonPlanStatus: (status) => set({ lessonPlanStatus: status }),
  setChatStatus: (status) => set({ chatStatus: status }),
  setWorksheetStatus: (status) => set({ worksheetStatus: status }),
  setAnswerKeyStatus: (status) => set({ answerKeyStatus: status }),
  setTestPaperStatus: (status) => set({ testPaperStatus: status }),

  resetAll: () =>
    set({
      lessonPlanStatus: "idle",
      chatStatus: "idle",
      worksheetStatus: "idle",
      answerKeyStatus: "idle",
    }),
}));

export default useApiStore;
