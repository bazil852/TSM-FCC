import { createSlice } from '@reduxjs/toolkit';

export const CarouselSelectedItemSlice = createSlice({
  name: 'selectedItem',
  initialState: {
    items: [],
    selectedMapID: null,
    selectedStartIndex: 0,
    continue: true,
    reportData: {
      recordingFileName: '',
      PNoScore: '',
      InstructorName: '',
      terrain: '',
      APC: '',
      Tanks: '',
      score: '',
      elapsedTime: 0,
      timeLeft: 0,
      totalTime: 0,
      totalEnemyTanks:0,
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
    setContinue: (state, action) => {
      state.continue = action.payload;
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
  setContinue,
  setTotalTime, // Export new actions
} = CarouselSelectedItemSlice.actions;

export default CarouselSelectedItemSlice.reducer;
