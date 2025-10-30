export function mapApiErrorToMessage(
  apiCode?: string,
  fallback?: string,
): string {
  switch (apiCode) {
    case "VALIDATION_ERROR":
      return "요청 값이 올바르지 않습니다.";
    case "UNAUTHORIZED":
      return "인증이 필요합니다. 다시 로그인해주세요.";
    case "WALLET_INSUFFICIENT_BALANCE":
      return "지갑의 잔액이 부족합니다.";
    case "BAD_REQUEST":
      return "잘못된 요청입니다.";
    case "NOT_FOUND":
      return "요청하신 정보를 찾을 수 없습니다.";
    default:
      return fallback || "알 수 없는 오류가 발생했습니다.";
  }
}
