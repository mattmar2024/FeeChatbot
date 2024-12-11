import axios from "axios";

const BASE_URL = "http://localhost:4000/api";

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Centralized error handler
const handleError = (error) => {
  if (error.response) {
    const message =
      error.response.data?.message || `Error: ${error.response.statusText}`;
    return Promise.reject(new Error(message));
  } else if (error.request) {
    return Promise.reject(
      new Error("No response from server. Please try again later.")
    );
  } else {
    return Promise.reject(
      new Error(error.message || "An unexpected error occurred.")
    );
  }
};

// API Service
const ApiService = {
  startConversation: async () => {
    try {
      const response = await apiClient.post("/conversation/start-conversation");
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  },

  getAllConversations: async () => {
    try {
      const response = await apiClient.get("/conversation/");
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  },

  getConversationById: async (id) => {
    try {
      const response = await apiClient.get(`/conversation/${id}`);
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  },

  sendMessage: async (id, message) => {
    try {
      const response = await apiClient.post(`/conversation/${id}`, { message });
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  },

  uploadContext: async (id, file) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await apiClient.post(
        `/conversation/upload-context/${id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  },
};

export default ApiService;
