import { useState, useMemo } from "react";
import type { ReactNode } from "react";
import {} from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  ApiResponse,
  ExchangeRate as ExchangeRateType,
  Wallet as WalletType,
} from "@/types/api";
import { Button } from "../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "../components/ui/dialog";
import { FaCaretUp } from "react-icons/fa";
import { FaCaretDown } from "react-icons/fa";
import { FaCircleChevronDown } from "react-icons/fa6";
import { exchangeRatesApi } from "../api/exchangeRates";
import { exchangeApi } from "../api/orders";
import { walletsApi } from "../api/wallets";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";

interface Currency {
  value: string;
  label: string;
  displayLabel: string;
  flag: ReactNode;
}

export default function Exchange() {
  const queryClient = useQueryClient();
  const [selectedCurrency, setSelectedCurrency] = useState("USD");
  const [isBuy, setIsBuy] = useState<boolean>(true);
  const [amount, setAmount] = useState("");
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertTitle, setAlertTitle] = useState<string>("");
  const [alertDesc, setAlertDesc] = useState<string>("");

  const [currencies] = useState<Currency[]>([
    {
      value: "USD",
      label: "미국 USD",
      displayLabel: "USD 환전하기",
      flag: (
        <svg
          className="w-5 h-4"
          viewBox="0 0 20 13"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect width="20" height="13" fill="#B22234" />
          <path
            d="M0 0H20V1.5H0V0ZM0 2.5H20V4H0V2.5ZM0 5H20V6.5H0V5ZM0 7.5H20V9H0V7.5ZM0 10H20V11.5H0V10Z"
            fill="white"
          />
          <rect x="0" y="0" width="8" height="7" fill="#3C3B6E" />
          <path
            d="M0 1.4L1.3 2.1V0.7L0 1.4ZM0 5.6L1.3 4.9V6.3L0 5.6ZM4 0.3L2.7 1.6L3.8 2.2L5.1 0.9L4 0.3ZM4 6.7L5.1 5.8L3.8 4.8L2.7 6.4L4 6.7ZM1.5 3.5L3.5 4.5V2.5L1.5 3.5Z"
            fill="white"
          />
        </svg>
      ),
    },
    {
      value: "JPY",
      label: "일본 JPY",
      displayLabel: "JPY 환전하기",
      flag: (
        <svg
          className="w-5 h-4"
          viewBox="0 0 20 13"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect width="20" height="13" fill="white" />
          <circle cx="10" cy="6.5" r="2.5" fill="#BC002D" />
        </svg>
      ),
    },
  ]);

  const selectedCurrencyData = currencies.find(
    (currency) => currency.value === selectedCurrency,
  );

  // 환율 데이터 조회 (1분마다 refetch)
  const {
    data: exchangeRatesData,
    isLoading: isLoadingRates,
    refetch: refetchExchangeRates,
  } = useQuery<ApiResponse<ExchangeRateType[]>>({
    queryKey: ["exchangeRates", "latest"],
    queryFn: exchangeRatesApi.getExchangeRatesLatest,
    refetchInterval: 60 * 1000, // 1분마다 refetch
    refetchIntervalInBackground: true, // 백그라운드에서도 refetch
  });

  // 지갑 데이터 조회
  const { data: walletsData, isLoading: isLoadingWallets } = useQuery<
    ApiResponse<WalletType[]>
  >({
    queryKey: ["wallets"],
    queryFn: walletsApi.getWallets,
  });

  // 선택된 통화의 환율 정보 찾기
  const selectedExchangeRate = useMemo(() => {
    const raw = exchangeRatesData?.data as any;
    const rates: ExchangeRateType[] = Array.isArray(raw)
      ? raw
      : raw?.rates || [];
    if (!rates || rates.length === 0) return null;
    return rates.find(
      (rate: any) => (rate.currency || rate.fromCurrency) === selectedCurrency,
    );
  }, [exchangeRatesData?.data, selectedCurrency]);

  // 필요 원화 계산
  const requiredKRW = useMemo(() => {
    if (!selectedExchangeRate || !amount || amount === "0") return 0;
    const rate = getRatePerUnit(selectedCurrency, selectedExchangeRate.rate);
    const amountNum = parseFloat(amount || "0");
    return rate * amountNum;
  }, [selectedExchangeRate, amount, selectedCurrency]);

  // 통화별 내 지갑 잔액 조회 유틸
  const getWalletBalance = (currencyCode: string): number => {
    const raw = walletsData?.data as any;
    const wallets: WalletType[] = Array.isArray(raw) ? raw : raw?.wallets || [];
    const found = wallets.find((w: WalletType) => w.currency === currencyCode);
    return found ? Number((found.balance as any) ?? 0) : 0;
  };

  // 통화 단위 보정: JPY는 API가 100엔 단위일 수 있어 1엔 기준으로 환산
  function getRatePerUnit(
    currencyCode: string,
    rawRate: string | number | undefined,
  ): number {
    const r = parseFloat((rawRate as any) ?? "0");
    if (!isFinite(r)) return 0;
    return currencyCode === "JPY" ? r / 100 : r;
  }

  // 총 보유 자산 계산 (KRW 기준)
  const totalAssets = useMemo(() => {
    const rawWallets = walletsData?.data as any;
    const rawRates = exchangeRatesData?.data as any;
    const wallets: WalletType[] = Array.isArray(rawWallets)
      ? rawWallets
      : rawWallets?.wallets || [];
    const rates: ExchangeRateType[] = Array.isArray(rawRates)
      ? rawRates
      : rawRates?.rates || [];

    return wallets.reduce((total: number, wallet: any) => {
      if (wallet.currency === "KRW") {
        return total + parseFloat(wallet.balance || "0");
      }
      // USD와 JPY는 환율을 곱해서 KRW로 변환
      const exchangeRate = rates.find(
        (rate: any) => (rate.currency || rate.fromCurrency) === wallet.currency,
      );
      if (exchangeRate && exchangeRate.rate) {
        return (
          total +
          parseFloat(wallet.balance || "0") *
            getRatePerUnit(wallet.currency, exchangeRate.rate)
        );
      }
      return total;
    }, 0);
  }, [walletsData?.data, exchangeRatesData?.data]);

  const handleExchange = async () => {
    if (!selectedExchangeRate || !amount || amount === "0") {
      setAlertTitle("입력 필요");
      setAlertDesc("금액을 입력해주세요.");
      setAlertOpen(true);
      return;
    }

    try {
      // exchangeType에 따라 fromCurrency/toCurrency 결정
      // "buy": KRW를 주고 외화를 받음 → fromCurrency: "KRW", toCurrency: selectedCurrency
      // "sell": 외화를 주고 KRW를 받음 → fromCurrency: selectedCurrency, toCurrency: "KRW"
      const fromCurrency = isBuy ? "KRW" : selectedCurrency;
      const toCurrency = isBuy ? selectedCurrency : "KRW";

      await exchangeApi.postOrders({
        exchangeRateId: Number(
          (selectedExchangeRate as any).id ??
            selectedExchangeRate.exchangeRateId ??
            0,
        ),
        fromCurrency,
        toCurrency,
        forexAmount: parseFloat(amount),
      });

      setAlertTitle("환전 완료");
      setAlertDesc("환전이 완료되었습니다.");
      setAlertOpen(true);
      // 환전 성공 후 금액 초기화 및 지갑 데이터 refetch
      setAmount("");
      queryClient.invalidateQueries({ queryKey: ["wallets"] });
    } catch (error: any) {
      // 환율 데이터 최신화 시도
      try {
        await refetchExchangeRates();
      } catch {}
      setAlertTitle("환전 실패");
      setAlertDesc(error?.message || "환전 중 오류가 발생했습니다.");
      setAlertOpen(true);
    }
  };

  // 환율 데이터 추출 (메모이제이션)
  const exchangeRates = useMemo(() => {
    const rates = (exchangeRatesData?.data as ExchangeRateType[]) || [];
    return [...rates].reverse();
  }, [exchangeRatesData?.data]);

  // 지갑 배열 추출 (응답 형태 표준화)
  const walletsArray = useMemo(() => {
    const raw = walletsData?.data as any;
    const arr: WalletType[] = Array.isArray(raw) ? raw : raw?.wallets || [];
    return arr;
  }, [walletsData?.data]);

  return (
    <div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 items-stretch">
        {/* Left Column */}
        <div className="space-y-6 flex flex-col">
          {/* 환율 정보 섹션 */}
          <div>
            <div className="flex gap-4">
              {isLoadingRates ? (
                <div className="flex-1 min-w-[143px] border border-border rounded-lg px-8 py-6 bg-card">
                  <div className="text-[24px] font-bold">로딩 중...</div>
                </div>
              ) : (
                exchangeRates.map((rate: any) => {
                  // changePercentage 필드 사용
                  const rawChange =
                    rate.changePercentage ?? rate.changePercent ?? null;
                  const parsedChange =
                    rawChange !== null ? parseFloat(rawChange) : null;
                  const roundedChange =
                    parsedChange !== null
                      ? Number(parsedChange.toFixed(1))
                      : null;
                  // 음수면 false (파랑 + 다운), 양수면 true (빨강 + 업)
                  const isPositive =
                    roundedChange !== null && roundedChange >= 0;

                  // 통화명에 따른 한글명 매핑
                  const currencyNameMap: Record<string, string> = {
                    USD: "미국 달러",
                    JPY: "일본 엔화",
                  };

                  return (
                    <div
                      key={`${rate.currency || rate.fromCurrency}-${
                        rate.id || Math.random()
                      }`}
                      className="flex-1 min-w-[143px] border border-border rounded-lg px-8 py-6 bg-card"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[20px] text-bold-foreground">
                          {rate.currency || rate.fromCurrency}
                        </span>
                        <span className="text-[16px] text-muted-foreground ml-1">
                          {currencyNameMap[
                            rate.currency || rate.fromCurrency
                          ] ||
                            rate.currencyName ||
                            rate.fromCurrency}
                        </span>
                      </div>
                      <div className="text-[24px] font-bold mb-1">
                        {rate.rate
                          ? `${getRatePerUnit(
                              rate.currency || rate.fromCurrency,
                              rate.rate,
                            ).toLocaleString("ko-KR", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })} KRW`
                          : "- KRW"}
                      </div>
                      {roundedChange !== null && roundedChange !== 0 && (
                        <div
                          className={`flex items-center text-[16px] ${
                            isPositive ? "text-red-500" : "text-blue-600"
                          }`}
                        >
                          {isPositive ? <FaCaretUp /> : <FaCaretDown />}{" "}
                          {`${
                            roundedChange > 0 ? "+" : ""
                          }${roundedChange.toFixed(1)}%`}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* 내 지갑 섹션 */}
          <div className="border border-border rounded-lg p-6 bg-[#F7F8F9] flex-1 flex flex-col">
            <h3 className="text-xl font-bold mb-4">내 지갑</h3>
            {isLoadingWallets ? (
              <div className="text-center py-4">로딩 중...</div>
            ) : (
              <>
                <div className="space-y-3">
                  {walletsArray.map((wallet: any) => (
                    <div key={wallet.currency} className="flex justify-between">
                      <span className="text-muted-foreground">
                        {wallet.currency}
                      </span>
                      <span className="font-semibold text-[#646F7C]">
                        {wallet.currency === "KRW" && "₩ "}
                        {wallet.currency === "USD" && "$ "}
                        {wallet.currency === "JPY" && "₩ "}
                        {Number(wallet.balance ?? 0).toLocaleString("ko-KR")}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="pt-4 border-t border-border mt-auto">
                  <div className="flex justify-between">
                    <span className="font-semibold text-[#646F7C]">
                      총 보유 자산
                    </span>
                    <span className="text-lg text-[#3479EB] font-bold">
                      ₩{" "}
                      {Math.floor(totalAssets).toLocaleString("ko-KR", {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      })}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right Column - 환전하기 섹션 */}
        <div className="border border-border rounded-lg p-6 bg-[#F7F8F9] h-full flex flex-col">
          <div className="mb-6">
            <Select
              value={selectedCurrency}
              onValueChange={(val) => {
                setSelectedCurrency(val);
                setAmount("");
                refetchExchangeRates();
              }}
            >
              <SelectTrigger className="w-[202px] h-12 text-base border-0 bg-transparent shadow-none hover:bg-gray-100 focus-visible:ring-0 [&_.select-icon]:!text-black [&_.select-icon]:!opacity-100 [&_.select-icon]:transition-transform [&[data-state=open]_.select-icon]:rotate-180">
                <SelectValue>
                  {selectedCurrencyData && (
                    <span className="flex items-center gap-2">
                      {selectedCurrencyData.flag}
                      <span>{selectedCurrencyData.displayLabel}</span>
                    </span>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {currencies.map((currency) => (
                  <SelectItem key={currency.value} value={currency.value}>
                    <span className="flex items-center gap-2">
                      {currency.flag}
                      <span>{currency.label}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 살래요/팔래요 토글 */}
          <div className="flex gap-2 mb-6 p-3 border-1 border-border rounded-lg bg-white">
            <Button
              variant={isBuy ? "default" : "outline"}
              onClick={() => {
                setIsBuy(true);
                setAmount("");
                refetchExchangeRates();
              }}
              className={`flex-1 h-[59px] text-[20px] text-[#FFA7A7] hover:text-[#FE5050] border-0 shadow-none ${
                isBuy
                  ? "bg-[#FE5050] hover:bg-[#FE5050]/90 text-white hover:text-white"
                  : ""
              }`}
            >
              살래요
            </Button>
            <Button
              variant={!isBuy ? "default" : "outline"}
              onClick={() => {
                setIsBuy(false);
                setAmount("");
                refetchExchangeRates();
              }}
              className={`flex-1 h-[59px] text-[20px] text-[#9DB6FF] hover:text-[#3479EB] border-0 shadow-none ${
                !isBuy
                  ? "bg-[#3479EB] hover:bg-[#3479EB]/90 text-white hover:text-white"
                  : ""
              }`}
            >
              팔래요
            </Button>
          </div>

          {/* 매수/매도 금액 */}
          <div className="mb-4">
            <label className="block text-[20px] text-[#646F7C] font-medium mb-2">
              {isBuy ? "매수 금액" : "매도 금액"}
            </label>
            <div className="w-full text-[20px] p-4 border rounded-md flex items-center justify-end gap-2 border-[#374553] bg-white">
              <input
                type="text"
                value={amount}
                onChange={(e) => {
                  let value = e.target.value.replace(/[^0-9]/g, "");
                  if (value.length > 1 && value.startsWith("0")) {
                    value = value.replace(/^0+/, "");
                  }
                  // 팔래요일 때, 선택 통화의 보유 잔액을 초과하지 않도록 제한
                  if (!isBuy) {
                    const max = Math.floor(getWalletBalance(selectedCurrency));
                    if (value !== "" && parseInt(value, 10) > max) {
                      value = String(max);
                    }
                  } else if (isBuy) {
                    // 살래요일 때, KRW 잔액을 초과하지 않도록 외화 수량을 제한
                    const krwBalance = Math.floor(getWalletBalance("KRW"));
                    const rate = selectedExchangeRate
                      ? getRatePerUnit(
                          selectedCurrency,
                          selectedExchangeRate.rate,
                        )
                      : 0;
                    if (rate > 0 && value !== "") {
                      const maxByKrw = Math.floor(krwBalance / rate);
                      if (parseInt(value, 10) > maxByKrw) {
                        value = String(maxByKrw);
                      }
                    }
                  }
                  setAmount(value);
                }}
                placeholder="0"
                className="flex-1 text-right outline-none bg-transparent text-[20px]"
              />
              <span>
                {selectedCurrency === "USD"
                  ? "달러"
                  : selectedCurrency === "JPY"
                  ? "엔화"
                  : selectedCurrency}{" "}
                {isBuy ? "사기" : "팔기"}
              </span>
            </div>
          </div>
          <i className="mb-4 flex justify-center">
            <FaCircleChevronDown className="text-[40px] text-[#D0D6DB]" />
          </i>

          {/* 필요 원화 */}
          <div className="mb-4">
            <label className="block text-[20px] text-[#646F7C] font-medium mb-2">
              필요 원화
            </label>
            <div className="text-[20px] text-right border-1 border-[#ACB4BB] p-4 rounded-lg bg-[#F1F2F4]">
              <span className="text-[#646F7C] font-semibold mr-[10px]">
                {requiredKRW
                  ? requiredKRW.toLocaleString("ko-KR", {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    })
                  : "0"}
              </span>
              {!isBuy ? (
                <span className="font-bold text-[#3479EB]">
                  원 받을 수 있어요
                </span>
              ) : (
                <span className="text-red-500 font-bold">원 필요해요</span>
              )}
            </div>
          </div>

          {/* 적용 환율 */}
          <div className="flex justify-between text-[20px] mb-6 border-t-1 border-[#C5C8CE] pt-8 mt-auto">
            <label className="block text-[#646F7C]">적용 환율</label>
            <div className="text-muted-foreground font-semibold">
              {selectedExchangeRate
                ? `1 ${selectedCurrency} = ${getRatePerUnit(
                    selectedCurrency,
                    selectedExchangeRate.rate,
                  ).toLocaleString("ko-KR", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })} 원`
                : "-"}
            </div>
          </div>

          {/* 환전하기 버튼 */}
          <Button
            variant="default"
            onClick={handleExchange}
            className="h-[77px] w-full py-6 text-[22px] font-bold bg-[#1B2334]"
          >
            환전하기
          </Button>
          <Dialog open={alertOpen} onOpenChange={setAlertOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{alertTitle}</DialogTitle>
                <DialogDescription>{alertDesc}</DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button className="mt-2 sm:mt-0">확인</Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
