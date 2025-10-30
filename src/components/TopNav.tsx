import { IoLogoRss } from "react-icons/io5";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";

export default function TopNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav className="bg-white border-b border-border px-10 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <IoLogoRss className="text-[#3479EB] text-[24px]" />
        <span className="text-[24px] font-bold">Exchange app</span>
      </div>
      <div className="flex items-center gap-[42px]">
        <button
          onClick={() => navigate("/exchange")}
          className={`text-[20px] cursor-pointer ${
            location.pathname === "/exchange" ? "font-bold" : "text-[#8899AA]"
          }`}
        >
          환전 하기
        </button>
        <button
          onClick={() => navigate("/history")}
          className={`text-[20px] cursor-pointer ${
            location.pathname === "/history" ? "font-bold" : "text-[#8899AA]"
          }`}
        >
          환전 내역
        </button>
        <Button
          onClick={handleLogout}
          variant="default"
          className="w-[94px] h-[43px] text-[20px] px-6 py-2 bg-[#3479EB] hover:bg-[#3479EB]/90 rounded-[12px]"
        >
          Log out
        </Button>
      </div>
    </nav>
  );
}
