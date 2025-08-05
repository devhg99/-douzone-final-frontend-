// 지금 있는 TeacherLoginPage.jsx 파일을 아래처럼 고쳐줘

import React, { useState } from 'react';
import useUserStore from '../store/useUserStore';
import { useNavigate } from 'react-router-dom';
import { login } from '../api/auth.ts'; // 백엔드 요청 함수

export default function TeacherLoginPage() {
  const setUser = useUserStore(state => state.setUser);
  const navigate = useNavigate();

  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    try {
      const user = await login(id, password); // 백엔드에 로그인 요청
      setUser(user); // 로그인 성공한 사용자 저장
      navigate('/dashboard'); // 다음 페이지로 이동
    } catch (err) {
      setError('로그인에 실패했어요. 아이디/비밀번호를 확인해주세요!');
    }
  };

  return (
    <div className="p-6 text-center">
      <h2 className="text-2xl font-bold mb-4">로그인</h2>
      <p className="mb-6">아이디와 비밀번호를 입력해주세요</p>

      <div className="mb-4">
        <input
          type="text"
          placeholder="아이디"
          value={id}
          onChange={e => setId(e.target.value)}
          className="border px-3 py-2 w-64 mb-2"
        />
        <input
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="border px-3 py-2 w-64"
        />
      </div>

      <button
        onClick={handleLogin}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        로그인
      </button>

      {error && <p className="text-red-500 mt-4">{error}</p>}
    </div>
  );
}
