import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ChatHeader() {
  const [isLogin, setIsLogin] = useState(false);
  let navigate = useNavigate();

  const handleAuth = () => {
    if (isLogin) {
      // 로그아웃 처리 로직
      setIsLogin(true);
    } else {
      // 네이버 소셜 로그인 페이지로 이동
      window.location.href = "http://localhost:8080/oauth2/authorization/naver";
      setIsLogin(true);
    }
  };
  return (
    <header className="flex items-center justify-between rounded-t-3xl border-b border-[#DADCE0] bg-white px-3 py-2">
      <div className="flex items-center gap-2">
        <button
          className="text-base font-semibold text-[#202124] md:text-lg"
          onClick={() => {
            navigate("/");
          }}
        >
          Segeum
        </button>
      </div>
      <div className="flex items-end  rounded-md hover:bg-[#D2E3FC] px-3 py-1 duration-200 font-bold">
        <button
          onClick={() => {
            {
              handleAuth();
            }
          }}
        >
          {isLogin ? "로그아웃" : "로그인"}
        </button>
      </div>
    </header>
  );
}
