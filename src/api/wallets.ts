import apiClient from "@/lib/api";
import type { ApiResponse, Wallet } from "@/types/api";

export const walletsApi = {
  getWallets: async (): Promise<ApiResponse<Wallet[]>> => {
    const response = await apiClient.get("/wallets");
    return response.data as ApiResponse<Wallet[]>;
  },
};
