import axios from "axios";
import { mapApiErrorToMessage } from "./errors";

// 환경변수에서 baseURL 가져오기, 없으면 기본값 사용
const BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://exchange-example.switchflow.biz";
// env 가드: 개발 환경에서 base url 미설정 경고
if (import.meta.env.DEV && !import.meta.env.VITE_API_BASE_URL) {
  // eslint-disable-next-line no-console
  console.warn(
    "[env] VITE_API_BASE_URL가 설정되지 않아 기본 URL을 사용합니다:",
    BASE_URL,
  );
}

// axios 인스턴스 생성
export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// 요청 인터셉터 (토큰 추가 등에 사용)
apiClient.interceptors.request.use(
  (config) => {
    // 필요시 여기서 토큰 등을 추가할 수 있습니다
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// 응답 인터셉터 (에러 처리 등에 사용)
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const status = error.response?.status;
    const apiCode: string | undefined = error.response?.data?.code;
    const apiMessage: string | undefined = error.response?.data?.message;
    const friendly = mapApiErrorToMessage(apiCode, apiMessage);

    if (status === 401) {
      localStorage.removeItem("token");
      sessionStorage.setItem(
        "redirectMessage",
        "세션이 만료되었습니다. 다시 로그인해주세요.",
      );
      if (window.location.pathname !== "/login") {
        window.location.href = "/login?reason=expired";
      }
    }

    const wrapped = new Error(friendly);
    // attach original for debugging if needed
    (wrapped as any).cause = error;
    return Promise.reject(wrapped);
  },
);

export default apiClient;
