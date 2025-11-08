import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0", // 모든 네트워크 인터페이스에서 접근 허용
    port: 5173,
    watch: {
      usePolling: true, // Docker 환경에서 파일 변경 감지
    },
  },
});
