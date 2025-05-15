import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { apiBaseUrl } from "../../config/urls";

export const fetchBuses = createAsyncThunk("buses/fetchBuses", async () => {
  const response = await axios.get(`${apiBaseUrl}/bus`);

  // Filter buses with dates of today or greater
  const today = new Date().toISOString().split("T")[0];
  const filteredData = response.data.filter((bus) => {
    const busDate = new Date(bus.date).toISOString().split("T")[0];
    return busDate >= today;
  });

  return filteredData;
});

const busesSlice = createSlice({
  name: "buses",
  initialState: { data: [], status: "idle" },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBuses.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchBuses.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.data = action.payload;
      })
      .addCase(fetchBuses.rejected, (state) => {
        state.status = "failed";
      });
  },
});

export default busesSlice.reducer;
