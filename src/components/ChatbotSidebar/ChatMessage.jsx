import React from 'react';

const ChatMessage = ({ message, isUser = false }) => {
  // URL을 감지하고 링크 버튼으로 변환하는 함수
  const formatMessage = (text) => {
    // URL 패턴 감지 (http/https로 시작하는 링크)
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    
    if (!text) return '안녕하세요! 무엇을 도와드릴까요?';
    
    // 대괄호 제거
    const cleanText = text.replace(/\[([^\]]*)\]/g, '$1');
    
    const parts = cleanText.split(urlRegex);
    
    return parts.map((part, index) => {
      if (urlRegex.test(part)) {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-2 px-4 py-2 bg-gradient-to-r from-[#667EEA] to-[#764BA2] text-white text-sm rounded-lg hover:from-[#5A67D8] hover:to-[#6B46C1] transition-all duration-200 shadow-sm hover:shadow-md"
          >
            PPT 자료 보기
          </a>
        );
      }
      return part;
    });
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-sm px-4 py-3 rounded-2xl shadow-sm ${
        isUser 
          ? 'bg-gradient-to-r from-[#667EEA] to-[#764BA2] text-white' 
          : 'bg-white text-slate-800 border border-slate-200'
      }`}>
        <div className="flex items-start gap-2">
          <div className="flex-1 min-w-0">
            <div className="text-sm leading-relaxed break-words whitespace-pre-wrap overflow-hidden">
              {formatMessage(message)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage; 