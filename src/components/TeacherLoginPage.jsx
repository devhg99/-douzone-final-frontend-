import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const TeacherLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({ email: '', password: '', general: '' });
  const [focusedField, setFocusedField] = useState('');
  const navigate = useNavigate();

  // 유효성 검사
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    const newErrors = { email: '', password: '', general: '' };
    
    if (!email) {
      newErrors.email = '이메일을 입력해주세요';
    } else if (!validateEmail(email)) {
      newErrors.email = '올바른 이메일 형식이 아닙니다';
    }
    
    if (!password) {
      newErrors.password = '비밀번호를 입력해주세요';
    }
    
    setErrors(newErrors);
    return !newErrors.email && !newErrors.password;
  };

  const handleLogin = () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    setErrors({ email: '', password: '', general: '' });
    
    // 목 데이터로 로그인 처리
    setTimeout(() => {
      // 간단한 목 인증 로직
      if (email === 'teacher@seoul.edu' && password === 'password123') {
        console.log('로그인 성공!');
        // 대시보드로 이동
        navigate('/dashboard');
      } else {
        setErrors({ 
          email: '', 
          password: '', 
          general: '이메일 또는 비밀번호가 올바르지 않습니다' 
        });
      }
      setIsLoading(false);
    }, 1500);
  };

  const handleForgotPassword = () => {
    alert('비밀번호 찾기 페이지로 이동합니다.');
  };

  const isFormValid = email && password && !isLoading;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* 왼쪽 로고 영역 */}
      <div className="flex-1 flex items-center justify-center px-8">
        <div className="text-center">
          {/* 로고 */}
          <div className="mx-auto w-48 h-48 bg-blue-500 rounded-full flex items-center justify-center mb-8 relative">
            {/* 배경 장식 점들 - 피그마 위치에 맞게 조정 */}
            <div className="absolute top-12 left-12 w-3 h-3 bg-green-400 rounded-full"></div>
            <div className="absolute top-16 right-16 w-3 h-3 bg-red-400 rounded-full"></div>
            <div className="absolute bottom-12 left-16 w-3 h-3 bg-yellow-400 rounded-full"></div>
            
            {/* 중앙 아이콘 - 피그마 디자인에 맞게 단순화 */}
            <div className="w-20 h-24 bg-white rounded-lg flex items-center justify-center shadow-lg">
              <div className="relative">
                {/* 세로 막대 */}
                <div className="w-1 h-16 bg-orange-400"></div>
                {/* 가로 막대 (상단) */}
                <div className="absolute top-0 left-0 w-8 h-1 bg-orange-400"></div>
                {/* 노란색 점 */}
                <div className="absolute bottom-2 left-0 w-2 h-2 bg-yellow-400 rounded-full transform -translate-x-0.5"></div>
              </div>
            </div>
          </div>
          
          {/* 학교명 */}
          <h1 className="text-4xl font-bold text-gray-800 mb-4">서울교육초등학교</h1>
          
          {/* 슬로건 */}
          <p className="text-gray-600 text-lg leading-relaxed">
            꿈과 희망을 키우는<br />
            스마트 교육 공간
          </p>
        </div>
      </div>

      {/* 오른쪽 로그인 폼 영역 */}
      <div className="flex-1 flex items-center justify-center px-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800">로그인</h2>
          </div>

          <div className="space-y-6">
            {/* 전체 에러 메시지 */}
            {errors.general && (
              <div className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-lg">
                {errors.general}
              </div>
            )}

            {/* 이메일 입력 */}
            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) {
                    setErrors(prev => ({ ...prev, email: '' }));
                  }
                }}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField('')}
                placeholder="이메일"
                className={`w-full px-4 py-4 border-2 rounded-lg text-gray-700 placeholder-gray-400 transition-all duration-200 outline-none ${
                  errors.email 
                    ? 'border-red-500 bg-red-50' 
                    : focusedField === 'email' 
                      ? 'border-blue-500 bg-white' 
                      : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
                disabled={isLoading}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-2">{errors.email}</p>
              )}
            </div>

            {/* 비밀번호 입력 */}
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) {
                    setErrors(prev => ({ ...prev, password: '' }));
                  }
                }}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField('')}
                placeholder="비밀번호"
                className={`w-full px-4 py-4 border-2 rounded-lg text-gray-700 placeholder-gray-400 transition-all duration-200 outline-none ${
                  errors.password 
                    ? 'border-red-500 bg-red-50' 
                    : focusedField === 'password' 
                      ? 'border-blue-500 bg-white' 
                      : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
                disabled={isLoading}
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-2">{errors.password}</p>
              )}
            </div>

            {/* 에러 상태 안내 메시지 */}
            {(errors.email || errors.password) && (
              <p className="text-red-500 text-sm text-center">
                이메일 또는 비밀번호가 올바르지 않습니다
              </p>
            )}

            {/* 로그인 버튼 */}
            <button
              onClick={handleLogin}
              disabled={!isFormValid}
              className={`w-full py-4 rounded-lg font-medium text-white transition-all duration-200 ${
                isFormValid
                  ? 'bg-blue-500 hover:bg-blue-600 active:bg-blue-700'
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  로그인 중...
                </div>
              ) : (
                '로그인'
              )}
            </button>

            {/* 비밀번호 찾기 링크 */}
            <div className="text-center">
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-blue-500 text-sm hover:text-blue-600 hover:underline transition-colors duration-200"
                disabled={isLoading}
              >
                비밀번호를 잊으셨나요?
              </button>
            </div>
          </div>

          {/* 테스트 계정 안내 */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-blue-800 text-sm font-medium mb-2">테스트 계정</p>
            <p className="text-blue-700 text-xs">
              이메일: teacher@seoul.edu<br />
              비밀번호: password123
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherLoginPage;