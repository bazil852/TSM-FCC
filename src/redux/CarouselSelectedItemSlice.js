import { createSlice } from '@reduxjs/toolkit';

export const CarouselSelectedItemSlice = createSlice({
  name: 'selectedItem',
  initialState: {
    items: [],
    selectedMapID: null,
    selectedStartIndex: 0,
    reportData: {
      recordingFileName: '',
      PNoScore: '',
      InstructorName: '',
      terrain: '',
      APC: '',
      Tanks: '',
      elapsedTime: 0, // Add elapsed time
      timeLeft: 0, // Add time left
      totalTime: 0, // Add total time
    },
  },
  reducers: {
    addItem: (state, action) => {
      state.items.push(action.payload);
    },
    removeItem: (state, action) => {
      const index = state.items.findIndex(({ id }) => id === action.payload.id);
      state.items.splice(index, 1);
    },
    setSelectedMapID: (state, action) => {
      state.selectedMapID = action.payload;
    },
    setSelectedStartIndex: (state, action) => {
      state.selectedStartIndex = action.payload;
    },
    setReportData: (state, action) => {
      state.reportData = { ...state.reportData, ...action.payload };
    },
    setElapsedTime: (state, action) => {
      state.reportData.elapsedTime = action.payload;
    },
    setTimeLeft: (state, action) => {
      state.reportData.timeLeft = action.payload;
    },
    setTotalTime: (state, action) => {
      state.reportData.totalTime = action.payload;
    },
  },
});

export const {
  addItem,
  removeItem,
  setSelectedMapID,
  setSelectedStartIndex,
  setReportData,
  setElapsedTime,
  setTimeLeft,
  setTotalTime, // Export new actions
} = CarouselSelectedItemSlice.actions;

export default CarouselSelectedItemSlice.reducer;
