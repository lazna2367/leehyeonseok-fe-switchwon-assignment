import TopNav from "../components/TopNav";
import { Outlet, useLocation } from "react-router-dom";

export default function AppLayout() {
  const location = useLocation();
  const seg = location.pathname.split("/")[1];
  const pathname = (seg === "history" ? "history" : "exchange") as
    | "exchange"
    | "history";

  const titleInfo = {
    exchange: {
      title: "환율 정보",
      description: "실시간 환율을 확인하고 간편하게 환전하세요.",
    },
    history: {
      title: "환전 내역",
      description: "환전 내역을 확인하실 수 있어요.",
    },
  };
  return (
    <div className="min-h-screen flex flex-col">
      <TopNav />
      <div className="px-20 py-10 flex flex-col flex-1">
        <div className="mb-10">
          <h2 className="text-[40px] font-bold mb-2">
            {titleInfo[pathname].title}
          </h2>
          <p className="text-xl text-[#374553]">
            {titleInfo[pathname].description}
          </p>
        </div>
        <Outlet />
      </div>
    </div>
  );
}
