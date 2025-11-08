import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ChatHeader() {
  const [isLogin, setIsLogin] = useState(false);
  let navigate = useNavigate();

  const checkLoginStatus = useCallback(async () => {
    try {
      // chatRooms 엔드포인트는 로그인된 세션에만 200을 반환하므로 상태 확인 용도로 재사용
      const res = await fetch("http://localhost:8080/api/chatRooms", {
        credentials: "include",
      });
      setIsLogin(res.ok);
    } catch (error) {
      setIsLogin(false);
    }
  }, []);

  useEffect(() => {
    checkLoginStatus();
  }, [checkLoginStatus]);

  const handleAuth = async () => {
    if (isLogin) {
      try {
        await fetch("http://localhost:8080/logout", {
          method: "POST",
          credentials: "include",
        });
        setIsLogin(false);
        navigate("/");
      } catch (error) {
        console.error("로그아웃 실패", error);
      }
    } else {
      window.location.href = "http://localhost:8080/oauth2/authorization/naver";
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
