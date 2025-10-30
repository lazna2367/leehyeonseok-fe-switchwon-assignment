import apiClient from "@/lib/api";

// 로그인 API
export const authApi = {
  login: async (email: string) => {
    // Swagger 문서에 따라 요청 데이터 구성
    const response = await apiClient.post(
      "/auth/login",
      { email },
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      },
    );
    return response.data.data;
  },

  logout: async () => {
    const response = await apiClient.post("/auth/logout");
    return response.data;
  },
};
