import React from 'react';
import useUIStore from '../../store/useUIStore';

const ChatMessage = ({ message, isUser = false, onSendMessage, timestamp }) => {
  const { triggerEventRefresh } = useUIStore();

  // URL을 감지하고 링크 버튼으로 변환하는 함수
  const formatMessage = (text) => {
    // URL 패턴 감지 (http/https로 시작하는 링크)
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    
    if (!text) return '';
    
    // 공지사항 응답 마커 확인
    const isNoticeResponse = text.includes('<!-- NOTICE_RESPONSE -->');
    
    // 마커 제거
    const cleanText = text.replace(/<!-- NOTICE_RESPONSE -->/g, '').replace(/\[([^\]]*)\]/g, '$1');
    
    // ****텍스트**** 패턴을 굵게 처리하는 함수
    const formatBoldText = (text) => {
      const boldRegex = /\*\*\*\*([^*]+)\*\*\*\*/g;
      return text.replace(boldRegex, '<strong>$1</strong>');
    };
    
    // 일정 관련 텍스트 감지 및 버튼 추가 (더 정확한 패턴)
    const scheduleRegex = /(\*\s*[^*\n]*?(?:수학여행|대청소|체육대회|운동회|시험|평가|행사)[^*\n]*?(?:일정|하는 날|예정|있어요|해요)[^*\n]*?)/g;
    
    // 미래 일정 감지 (공지사항 content에서 - 내용이 있는 경우만)
    const futureScheduleRegex = /(\d+월\s*\d+일[^:]*:[^.]*?(?:예정되어\s*있습니다|있습니다|예정|일정|행사|대회|시험|평가|축제|공연|체험|먹거리|장터|부스|한마당|예방접종|예방|접종|독감|보건)[^.]*?)(?:\.|$)/g;
    let lastIndex = 0;
    const elements = [];
    const processedSchedules = new Set(); // 중복 방지를 위한 Set
    
    // 일정 관련 텍스트 찾기
    let match;
    while ((match = scheduleRegex.exec(cleanText)) !== null) {
      // 일정 텍스트 이전 부분 추가
      if (match.index > lastIndex) {
        const beforeText = cleanText.slice(lastIndex, match.index);
        if (beforeText) {
          elements.push(beforeText);
        }
      }
      
      // 일정 텍스트와 버튼 추가
      const scheduleText = match[1];
      
      // 중복 체크
      if (!processedSchedules.has(scheduleText)) {
        processedSchedules.add(scheduleText);
        elements.push(
          <div key={`schedule-${match.index}`} className="mb-2">
            <div className="text-sm">{scheduleText}</div>
            <button
              onClick={() => handleScheduleAdd(scheduleText)}
              className="inline-block mt-1 px-3 py-1 bg-gradient-to-r from-green-500 to-green-600 text-white text-xs rounded-md hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              📅 일정 추가
            </button>
          </div>
        );
      }
      
      lastIndex = match.index + match[0].length;
    }
    
    // 미래 일정 찾기 (공지사항에서만)
    if (isNoticeResponse) {
      while ((match = futureScheduleRegex.exec(cleanText)) !== null) {
        // 미래 일정 텍스트 이전 부분 추가
        if (match.index > lastIndex) {
          const beforeText = cleanText.slice(lastIndex, match.index);
          if (beforeText) {
            elements.push(beforeText);
          }
        }
        
        // 미래 일정 텍스트와 버튼 추가
        const futureScheduleText = match[1];
        
        // 중복 체크
        if (!processedSchedules.has(futureScheduleText)) {
          processedSchedules.add(futureScheduleText);
          elements.push(
            <div key={`future-schedule-${match.index}`} className="mb-2">
              <div className="text-sm">{futureScheduleText}</div>
              <button
                onClick={() => handleScheduleAdd(futureScheduleText)}
                className="group relative inline-flex items-center gap-1.5 mt-2 px-3 py-1.5 bg-[#667EEA]/10 text-[#667EEA] text-xs font-medium rounded-lg hover:bg-[#667EEA]/20 transition-all duration-300 shadow-sm hover:shadow-lg border border-[#667EEA]/20 hover:border-[#667EEA]/30"
              >
                <div className="flex items-center justify-center w-4 h-4 rounded-full bg-[#667EEA]/20 group-hover:bg-[#667EEA]/30 transition-colors duration-300">
                  <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <span className="relative z-10">일정 추가</span>
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            </div>
          );
        }
        
        lastIndex = match.index + match[0].length;
      }
    }
    
    // 남은 텍스트 추가
    if (lastIndex < cleanText.length) {
      const remainingText = cleanText.slice(lastIndex);
      if (remainingText) {
        elements.push(remainingText);
      }
    }
    
    // 모든 텍스트 요소에 굵게 처리 적용
    const processedElements = elements.map((element, index) => {
      if (typeof element === 'string') {
        return <span key={`text-${index}`} dangerouslySetInnerHTML={{ __html: formatBoldText(element) }} />;
      }
      return element;
    });
    
    // URL을 PPT 자료 버튼으로 변환
    const finalElements = processedElements.map((element, index) => {
      if (element && element.props && element.props.dangerouslySetInnerHTML) {
        // 이미 처리된 텍스트 요소인 경우
        const text = element.props.dangerouslySetInnerHTML.__html;
        const parts = text.split(urlRegex);
        return parts.map((part, partIndex) => {
          if (urlRegex.test(part)) {
            return (
              <button
                key={`${index}-${partIndex}`}
                onClick={() => window.open(part, '_blank', 'noopener,noreferrer')}
                className="group relative inline-flex items-center gap-1.5 mt-2 px-3 py-1.5 bg-[#667EEA]/10 text-[#667EEA] text-xs font-medium rounded-lg hover:bg-[#667EEA]/20 transition-all duration-300 shadow-sm hover:shadow-lg border border-[#667EEA]/20 hover:border-[#667EEA]/30"
              >
                <div className="flex items-center justify-center w-5 h-5 rounded-full bg-[#667EEA]/20 group-hover:bg-[#667EEA]/30 transition-colors duration-300">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <span className="relative z-10">PPT 자료</span>
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            );
          }
          return <span key={`${index}-${partIndex}`} dangerouslySetInnerHTML={{ __html: part }} />;
        });
      }
      return element;
    });
    
    return finalElements;
  };

  // 일정 추가 버튼 클릭 핸들러
  const handleScheduleAdd = (scheduleText) => {
    console.log('일정 추가 버튼 클릭:', scheduleText);
    
    // 콜론(:) 뒤의 내용에서 실제 일정 날짜와 제목 추출
    const colonIndex = scheduleText.indexOf(':');
    if (colonIndex === -1) {
      console.log('콜론을 찾을 수 없음');
      return;
    }
    
    const contentAfterColon = scheduleText.substring(colonIndex + 1).trim();
    console.log('콜론 뒤 내용:', contentAfterColon);
    
    // 해당 일정과 관련된 공지사항 내용만 추출
    const getRelevantNoticeContent = (scheduleText, fullMessage) => {
      // 콜론(:) 앞의 날짜 부분 추출
      const colonIndex = scheduleText.indexOf(':');
      if (colonIndex === -1) return fullMessage;
      
      const datePart = scheduleText.substring(0, colonIndex).trim();
      
      // 전체 메시지에서 해당 날짜와 관련된 부분만 찾기
      const lines = fullMessage.split('\n');
      let relevantContent = '';
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.includes(datePart)) {
          // 해당 날짜 라인부터 다음 날짜 라인 전까지의 내용 수집
          relevantContent = line;
          for (let j = i + 1; j < lines.length; j++) {
            const nextLine = lines[j].trim();
            // 다음 날짜 라인이 나오면 중단
            if (nextLine.match(/^\d+월\s*\d+일/)) {
              break;
            }
            relevantContent += '\n' + nextLine;
          }
          break;
        }
      }
      
      // 날짜 부분(예: "09월 09일:") 제거
      if (relevantContent) {
        // 날짜 패턴 제거 (예: "09월 09일:", "09월 09일 :")
        relevantContent = relevantContent.replace(/^\d+월\s*\d+일\s*:\s*/, '');
        // 앞의 "- " 제거 (예: "- 2025학년도...")
        relevantContent = relevantContent.replace(/^-\s*/, '');
        // 앞뒤 공백 정리
        relevantContent = relevantContent.trim();
      }
      
      return relevantContent || fullMessage;
    };
    
    const relevantNoticeContent = getRelevantNoticeContent(scheduleText, message);
    
    // 기간 일정 감지 (부터 ~까지) - 괄호가 있는 날짜 형식도 지원
    const periodMatch = contentAfterColon.match(/(\d+월\s*\d+일(?:\([^)]*\))?)부터\s*(\d+월\s*\d+일(?:\([^)]*\))?)까지/);
    const eventMatch = contentAfterColon.match(/(예방접종|수학|경연|대회|축구|경기|관람|행사|시험|평가|대청소|체육대회|운동회|취침|수학여행|공사|바닥|스크린|중간고사|기말고사|고사|축제|공연|체험|먹거리|장터|부스|한마당|예방|접종|독감|보건)/);
    
    console.log('기간 매칭:', periodMatch);
    console.log('이벤트 매칭:', eventMatch);
    
    if (periodMatch && eventMatch) {
      const startDate = periodMatch[1];
      const endDate = periodMatch[2];
      const event = eventMatch[1];
      
      // 기간 일정 메시지 생성 (관련 공지사항 내용만 포함)
      const message = `${startDate}부터 ${endDate}까지 ${event} 일정을 추가해줘. 상세내용: ${relevantNoticeContent}`;
      console.log('생성된 메시지:', message);
      
      if (message && onSendMessage) {
        // 사용자 메시지 없이 바로 AI 응답만 처리
        onSendMessage(message, true); // 두 번째 파라미터로 silent 모드 표시
        
        // 일정 추가 후 프론트엔드 업데이트 트리거
        setTimeout(() => {
          triggerEventRefresh();
        }, 1000); // 1초 후 트리거 (AI 응답 완료 대기)
      }
    } else {
      // 단일 일정 처리 (시간 정보 포함)
      const dateMatch = contentAfterColon.match(/(\d+월\s*\d+일(?:\([^)]*\))?)/);
      const timeMatch = contentAfterColon.match(/(오전|오후)\s*(\d+시)/);
      const singleEventMatch = contentAfterColon.match(/(예방접종|수학|경연|대회|축구|경기|관람|행사|시험|평가|대청소|체육대회|운동회|취침|수학여행|공사|바닥|스크린|중간고사|기말고사|고사|축제|공연|체험|먹거리|장터|부스|한마당|예방|접종|독감|보건)/);
      
      console.log('단일 날짜 매칭:', dateMatch);
      console.log('시간 매칭:', timeMatch);
      console.log('단일 이벤트 매칭:', singleEventMatch);
      
      if (dateMatch && singleEventMatch) {
        const date = dateMatch[1];
        const event = singleEventMatch[1];
        
        // 시간 정보가 있으면 포함 (관련 공지사항 내용만 포함)
        let message;
        if (timeMatch) {
          const timePeriod = timeMatch[1]; // 오전/오후
          const timeHour = timeMatch[2];   // 시
          message = `${date} ${timePeriod} ${timeHour} ${event} 일정을 추가해줘. 상세내용: ${relevantNoticeContent}`;
        } else {
          message = `${date} ${event} 일정을 추가해줘. 상세내용: ${relevantNoticeContent}`;
        }
        
        console.log('생성된 메시지:', message);
        
        if (message && onSendMessage) {
          // 사용자 메시지 없이 바로 AI 응답만 처리
          onSendMessage(message, true); // 두 번째 파라미터로 silent 모드 표시
          
          // 일정 추가 후 프론트엔드 업데이트 트리거
          setTimeout(() => {
            triggerEventRefresh();
          }, 1000); // 1초 후 트리거 (AI 응답 완료 대기)
        }
      } else {
        console.log('매칭 실패 - 기간:', periodMatch, '단일:', dateMatch, '시간:', timeMatch, '이벤트:', eventMatch || singleEventMatch);
      }
    }
  };

  // 시간 포맷팅 함수
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const timeString = date.toLocaleTimeString('ko-KR', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
    // "오후 4:57" 형식으로 변환
    return timeString.replace('오전 ', '오전 ').replace('오후 ', '오후 ');
  };

  return (
    <div className={`flex ${isUser ? 'flex-row-reverse' : 'flex-row'} items-end gap-2`}>
      <div className={`max-w-sm px-4 py-3 rounded-2xl shadow-sm ${
        isUser 
          ? 'bg-[#667EEA] text-white border border-[#667EEA]' 
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
      {/* 대화시간 표시 - 사이드 아래 */}
      <div className="text-xs text-slate-400 mb-1">
        {formatTime(timestamp)}
      </div>
    </div>
  );
};

export default ChatMessage; 