import axios from "axios";
import config from "./config";

const emptyResult = {
  selectedIndexes: [],
  sum: 0,
  elapsedTicks: 0,
  elapsedMilliseconds: 0,
};
const api = {
  generate: async (values, signal) => {
    try {
      const response = await axios.get(`${config.serverUrl}/generate`, {
        params: values,
        signal,
      });
      return response.data;
    } catch (error) {
      if (error.name !== "CanceledError") {
        console.error("Error fetching data:", error);
      }
      return [];
    }
  },

  emptyResult,
  
  genetic: async (values, options, signal) => {
    try {
      const response = await axios.post(
        `${config.serverUrl}/genetic`,
        {
          weights: values,
          chunkGap: 3,
          ...options,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          signal,
        }
      );
      return response.data;
    } catch (error) {
      if (error.name !== "CanceledError") {
        console.error("Error fetching data:", error);
      }
      return emptyResult;
    }
  },

  greedy: async (values, signal) => {
    try {
      const response = await axios.post(
        `${config.serverUrl}/greedy`,
        {
          weights: values,
          chunkGap: 3,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          signal,
        }
      );
      return response.data;
    } catch (error) {
      if (error.name !== "CanceledError") {
        console.error("Error fetching data:", error);
      }
      return emptyResult;
    }
  },
};

export default api;
