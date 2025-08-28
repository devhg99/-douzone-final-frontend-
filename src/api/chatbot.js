const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/v1';

/**
 * 챗봇과 대화하는 API 함수
 * @param {string} message - 사용자 메시지
 * @param {string} context - 대화 컨텍스트 (선택사항)
 * @returns {Promise<Object>} AI 응답
 */
export const sendChatMessage = async (message, context = '') => {
  try {
    const response = await fetch(`${API_BASE_URL}/ai/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: message,
        context: context
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('챗봇 API 호출 중 오류:', error);
    throw error;
  }
};

/**
 * 교사 업무 특화 챗봇 API 함수
 * @param {string} message - 사용자 메시지
 * @param {string} category - 업무 카테고리 (attendance, grades, etc.)
 * @returns {Promise<Object>} AI 응답
 */
export const sendTeacherChatMessage = async (message, category = 'general') => {
  try {
    const response = await fetch(`${API_BASE_URL}/ai/chatbot`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: message,
        category: category
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('교사 챗봇 API 호출 중 오류:', error);
    throw error;
  }
};

/**
 * 챗봇 연결 상태 확인
 * @returns {Promise<boolean>} 연결 상태
 */
export const checkChatbotConnection = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/ai/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return response.ok;
  } catch (error) {
    console.error('챗봇 연결 확인 중 오류:', error);
    return false;
  }
};

/**
 * 대화 히스토리 저장 (선택사항)
 * @param {Array} messages - 대화 메시지 배열
 * @returns {Promise<Object>} 저장 결과
 */
export const saveChatHistory = async (messages) => {
  try {
    const response = await fetch(`${API_BASE_URL}/ai/chat/history`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: messages
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('대화 히스토리 저장 중 오류:', error);
    throw error;
  }
}; 