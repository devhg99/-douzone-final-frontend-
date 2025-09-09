import React, { useState } from "react";
import logo from "../assets/images/logo_login.svg";
import { useNavigate } from "react-router-dom";

const TeacherLoginPage = () => {
  const [formData, setFormData] = useState({ id: "", password: "" });
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLogin = async () => {
    try {
      console.log("⚠️ 백엔드 없이 테스트 로그인 실행");

      // 👉 필요하면 여기에 로컬스토리지 토큰 저장도 가능
      // localStorage.setItem('token', 'dummy-token');

      navigate("/dashboard");
    } catch (error) {
      console.error("❌ 로그인 실패:", error.message);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* 좌측 영역 */}
      <div className="hidden lg:flex lg:w-1/2 bg-white items-center justify-center px-8">
        <div className="text-center max-w-sm">
          <img
            src={logo}
            alt="티봇초등학교 로고"
            className="w-32 h-32 mx-auto mb-6"
          />
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            티봇초등학교
          </h1>
          <p className="text-sm text-gray-600 leading-relaxed">
            올바른 인성을 기르는
            <br />
            소통의 교육 공간
          </p>
        </div>
      </div>

      {/* 로그인 폼 */}
      <div className="w-full lg:w-1/2 bg-gray-50 flex items-center justify-center px-8 py-12">
        <div className="w-full max-w-sm text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-8">로그인</h2>

          <div className="space-y-4">
            {/* ✅ 아이디 입력 */}
            <input
              type="text"
              name="id"
              value={formData.id}
              onChange={handleInputChange}
              placeholder="아이디"
              className="w-full px-4 py-3.5 border border-gray-200 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />

            {/* 비밀번호 입력 */}
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="비밀번호"
              className="w-full px-4 py-3.5 border border-gray-200 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />

            {/* 로그인 버튼 */}
            <button
              type="button"
              onClick={handleLogin}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3.5 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              로그인
            </button>

            <div className="text-sm pt-2">
              <a href="#" className="text-blue-600 hover:text-blue-700">
                비밀번호를 잊으셨나요?
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherLoginPage;
