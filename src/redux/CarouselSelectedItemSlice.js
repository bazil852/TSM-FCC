import { createSlice } from '@reduxjs/toolkit';

export const CarouselSelectedItemSlice = createSlice({
  name: 'selectedItem',
  initialState: {
    items: [],
    selectedMapID: null, // Initialize selectedMapID
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
  },
});

export const { addItem, removeItem, setSelectedMapID } =
  CarouselSelectedItemSlice.actions;
export default CarouselSelectedItemSlice.reducer;
