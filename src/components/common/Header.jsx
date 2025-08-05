import React from 'react';
import useUserStore from '../../store/useUserStore';
import { useNavigate } from 'react-router-dom';

export default function Header() {
  const logout = useUserStore(state => state.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/'); // 로그아웃 후 로그인 페이지로 이동
  };

  return (
    <header className="bg-white shadow p-4 flex justify-between items-center">
      <h1 className="text-lg font-bold">헤더</h1>
      <button
        onClick={handleLogout}
        className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
      >
        로그아웃
      </button>
    </header>
  );
}
