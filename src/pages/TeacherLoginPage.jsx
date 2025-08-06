import React from 'react';
import axios from 'axios';
import logo from '../assets/images/logo_login.svg';
import { useState } from 'react';

const TeacherLoginPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleInputChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/auth/login`, {
        id: formData.email,
        password: formData.password,
      });

      console.log('✅ 로그인 성공:', response.data);
      // TODO: 로그인 성공 시 상태 저장 또는 페이지 이동 등 추가
    } catch (error) {
      console.error('❌ 로그인 실패:', error.response?.data || error.message);
      // TODO: 사용자에게 에러 메시지 표시 추가 가능
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* 좌측 로고 및 학교 정보 영역 */}
      <div className="hidden lg:flex lg:w-1/2 bg-white items-center justify-center px-8">
        <div className="text-center max-w-sm">
          <img src={logo} alt="서울교육초등학교 로고" className="w-32 h-32 mx-auto mb-6" />
          <h1 className="text-xl font-semibold text-gray-900 mb-2">서울교육초등학교</h1>
          <p className="text-sm text-gray-600 leading-relaxed">
            올바른 인성을 기르는
            <br />
            소통의 교육 공간
          </p>
        </div>
      </div>

      {/* 우측 로그인 폼 영역 */}
      <div className="w-full lg:w-1/2 bg-gray-50 flex items-center justify-center px-8 py-12">
        <div className="w-full max-w-sm">
          {/* 모바일 로고 */}
          <div className="lg:hidden text-center mb-8">
            <img src={logo} alt="서울교육초등학교 로고" className="w-20 h-20 mx-auto mb-4" />
            <h1 className="text-lg font-semibold text-gray-900 mb-1">서울교육초등학교</h1>
            <p className="text-xs text-gray-600">올바른 인성을 기르는 소통의 교육 공간</p>
          </div>

          {/* 로그인 타이틀 */}
          <h2 className="text-2xl font-semibold text-gray-900 mb-8 text-center">로그인</h2>

          {/* 로그인 폼 */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="이메일"
                className="w-full px-4 py-3.5 border border-gray-200 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                required
              />
            </div>
            <div>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="비밀번호"
                className="w-full px-4 py-3.5 border border-gray-200 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3.5 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              로그인
            </button>
            <div className="text-center pt-2">
              <a
                href="#"
                className="text-sm text-blue-600 hover:text-blue-700 transition-colors duration-200"
              >
                비밀번호를 잊으셨나요?
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TeacherLoginPage;
