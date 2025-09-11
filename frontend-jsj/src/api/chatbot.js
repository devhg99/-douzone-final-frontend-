const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

/**
 * 챗봇과 대화하는 API 함수
 * @param {string} message - 사용자 메시지
 * @returns {Promise<Object>} AI 응답
 */
export const sendChatMessage = async (message) => {
  try {
    const response = await fetch(`${API_BASE_URL}/ai/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: message
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