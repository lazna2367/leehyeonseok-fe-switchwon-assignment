import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { IoLogoRss } from "react-icons/io5";
import { authApi } from "../api/auth";

// 이메일 형식 검증 함수
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export default function Login() {
  const navigate = useNavigate();
  const [emailError, setEmailError] = useState<string>("");
  const [notice, setNotice] = useState<string>("");

  useEffect(() => {
    const msg = sessionStorage.getItem("redirectMessage");
    if (msg) {
      setNotice(msg);
      sessionStorage.removeItem("redirectMessage");
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError("");

    const email = (e.target as HTMLFormElement).email.value.trim();

    // 이메일 형식 검증
    if (!email) {
      setEmailError("이메일 형식이 올바르지 않습니다.");
      return;
    }

    if (!isValidEmail(email)) {
      setEmailError("이메일 형식이 올바르지 않습니다.");
      return;
    }

    try {
      const { token } = await authApi.login(email);

      if (!token) {
        setEmailError("로그인에 실패했습니다.");
        return;
      }

      // localStorage에 토큰만 저장
      localStorage.setItem("token", token);

      // 환전 페이지로 이동
      navigate("/exchange");
    } catch (error: any) {
      console.error(error);
      // 에러 처리 (예: 서버 에러 메시지 표시)
      if (error.response?.data?.message) {
        setEmailError(error.response.data.message);
      } else {
        setEmailError("로그인에 실패했습니다.");
      }
    }
  };

  return (
    <div className="flex items-center justify-center flex-col h-screen bg-gray-50">
      <div className="flex flex-col items-center justify-center mb-12">
        <i className="text-[#3479EB] text-[65px]">
          <IoLogoRss />
        </i>
        <h1 className="text-[48px] font-bold">반갑습니다.</h1>
        <p className="text-[32px] text-[#646F7C]">
          로그인 정보를 입력해주세요.
        </p>
        {notice && (
          <div className="mt-4 text-[18px] text-[#3479EB]">{notice}</div>
        )}
      </div>
      <Card className="py-6 px-8 w-[560px] text-center rounded-[18px] bg-[#F7F8F9]">
        <form onSubmit={handleSubmit} noValidate>
          <p className="text-[20px] mb-3 text-[#646F7C] text-left">
            이메일 주소를 입력해주세요.
          </p>
          <div className="mb-4">
            <Input
              name="email"
              type="email"
              placeholder="이메일 입력"
              required
              className={`h-[75px] w-[496px] !text-[22px] p-6 border-solid ${
                emailError ? "border-red-500" : "border-[#374553]"
              }`}
              aria-invalid={emailError ? true : undefined}
              onChange={() => setEmailError("")}
            />
            <div className="mt-2 h-5 text-left">
              {emailError ? (
                <span className="text-red-500 text-sm">{emailError}</span>
              ) : null}
            </div>
          </div>
          <Button
            type="submit"
            className="w-full bg-[#1B2334] text-white h-[77px] w-[496px] text-[22px] cursor-pointer"
          >
            로그인 하기
          </Button>
        </form>
      </Card>
    </div>
  );
}
