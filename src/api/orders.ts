import apiClient from "@/lib/api";
import type { ApiResponse, Order } from "@/types/api";

// 환전 관련 API
export const exchangeApi = {
  getOrdersList: async (): Promise<ApiResponse<Order[]>> => {
    const response = await apiClient.get("/orders");
    return response.data as ApiResponse<Order[]>;
  },
  postOrders: async (data: {
    exchangeRateId: number;
    fromCurrency: string;
    toCurrency: string;
    forexAmount: number;
  }) => {
    const response = await apiClient.post("/orders", data);
    return response.data;
  },
  getOrderQuote: async () => {
    const response = await apiClient.get("/orders/quote");
    return response.data;
  },
};
