import { createSlice } from '@reduxjs/toolkit';

export const CarouselSelectedItemSlice = createSlice({
  name: 'selectedItem',
  initialState: {
    items: [],
    selectedMapID: null, // Initialize selectedMapID
    selectedStartIndex: 0, // Initialize selectedMapID
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
  },
});

export const { addItem, removeItem, setSelectedMapID, setSelectedStartIndex } =
  CarouselSelectedItemSlice.actions;
export default CarouselSelectedItemSlice.reducer;
