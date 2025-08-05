import React from 'react';
import { NavLink } from 'react-router-dom';

const menuItems = [
  { name: '대시보드', path: '/dashboard' },
  { name: '출결 관리', path: '/attendance' },
  { name: '성적 관리', path: '/grades' },
  { name: '생활기록부', path: '/reports' },
  { name: '생활지도', path: '/behavior' },
  { name: '상담 관리', path: '/counseling' },
  { name: '가정통신문', path: '/letter' },
  { name: '학급 일정', path: '/schedule' },
  { name: '교내 행사', path: '/events' },
];

export default function Sidebar() {
  return (
    <aside className="w-64 bg-gray-800 text-white h-screen p-4">
      <h2 className="text-xl font-bold mb-6">교사용 시스템</h2>
      <nav className="space-y-2">
        {menuItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `block px-3 py-2 rounded hover:bg-gray-700 ${
                isActive ? 'bg-gray-700 font-semibold' : ''
              }`
            }
          >
            {item.name}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
