export interface ApiResponse<T> {
  code: string; // "OK" | error codes
  message: string;
  data: T;
}

export interface ExchangeRate {
  id?: number;
  exchangeRateId?: number;
  currency?: string; // USD, JPY
  fromCurrency?: string;
  toCurrency?: string;
  rate: number | string;
  changePercent?: number | string;
  changePercentage?: number | string;
}

export interface Wallet {
  currency: string; // KRW, USD, JPY
  balance: number | string;
}

export interface Order {
  orderId: number;
  fromCurrency: string;
  fromAmount: number;
  toCurrency: string;
  toAmount: number;
  appliedRate: number;
  orderedAt: string; // ISO
}
