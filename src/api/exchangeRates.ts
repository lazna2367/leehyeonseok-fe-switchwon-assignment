import apiClient from "@/lib/api";
import type { ApiResponse, ExchangeRate } from "@/types/api";

export const exchangeRatesApi = {
  getExchangeRatesLatest: async (): Promise<ApiResponse<ExchangeRate[]>> => {
    const response = await apiClient.get("/exchange-rates/latest");
    return response.data as ApiResponse<ExchangeRate[]>;
  },
};
