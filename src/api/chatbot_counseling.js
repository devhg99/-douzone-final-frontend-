// chatbot_counseling.js — 개선된 버전
const API_COUNCELING_URL = process.env.REACT_APP_API_COUNSELING_URL;

/**
 * 상담(Milvus RAG) 챗봇과 대화하는 API 함수.
 * 
 * @param {string|object} messageOrPayload - 메시지 문자열 또는 전체 요청 객체
 * @param {object} options - 추가 옵션 (선택사항)
 * @param {string} options.student_name - 학생 이름
 * @param {string} options.worry_tag_filter - 걱정 태그 필터
 * @param {boolean} options.use_rag - RAG 사용 여부 (기본값: true)
 * 
 * 사용 예시:
 * 1. 간단한 질문: sendCounselingMessage("안녕하세요")
 * 2. 옵션과 함께: sendCounselingMessage("고민이 있어요", { student_name: "김철수", worry_tag_filter: "우울" })
 * 3. 전체 객체: sendCounselingMessage({ query: "도움이 필요해요", student_name: "박영희", worry_tag_filter: "불안", use_rag: true })
 */
export const sendCounselingMessage = async (messageOrPayload, options = {}) => {
  try {
    console.log('=== 상담 챗봇 API 호출 시작 ===');
    console.log('API_COUNCELING_URL:', API_COUNCELING_URL);

    const apiUrl = `${API_COUNCELING_URL.replace(/\/$/, '')}/gemini/master-chat`;
    console.log('전체 API URL:', apiUrl);

    let requestBody;

    if (typeof messageOrPayload === 'string') {
      // 문자열 메시지인 경우: 옵션을 활용하여 requestBody 구성
      requestBody = {
        query: messageOrPayload,
        use_rag: options.use_rag !== undefined ? options.use_rag : true,
        worry_tag_filter: options.worry_tag_filter || "string", // 기본값 유지
        student_name: options.student_name || "string" // 기본값 유지
      };
    } else if (typeof messageOrPayload === 'object' && messageOrPayload !== null) {
      // 객체가 전달된 경우: 그대로 사용하되, 누락된 필드는 기본값으로 보완
      requestBody = {
        query: messageOrPayload.query,
        use_rag: messageOrPayload.use_rag !== undefined ? messageOrPayload.use_rag : true,
        worry_tag_filter: messageOrPayload.worry_tag_filter || "string",
        student_name: messageOrPayload.student_name || "string",
        ...messageOrPayload // 다른 추가 필드들도 포함
      };
    } else {
      throw new Error('Invalid argument: messageOrPayload must be string or object');
    }

    console.log('요청 본문:', requestBody);

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    console.log('응답 상태:', response.status, response.statusText);
    if (!response.ok) {
      const errorText = await response.text();
      console.error('HTTP 오류 응답 본문:', errorText);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const contentType = response.headers.get('content-type') || '';
    let data;
    if (contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const textData = await response.text();
      data = { response: textData };
    }

    console.log('파싱된 응답 데이터:', data);
    return data;
  } catch (error) {
    console.error('sendCounselingMessage error:', error);
    throw error;
  }
};

/**
 * 사용자 컨텍스트 관리를 위한 헬퍼 함수들
 */

// 현재 세션의 사용자 정보를 저장할 변수 (메모리 저장)
let currentUserContext = {
  student_name: null,
  worry_tag_filter: null
};

/**
 * 사용자 컨텍스트 설정
 */
export const setUserContext = (student_name, worry_tag_filter) => {
  currentUserContext = {
    student_name: student_name || currentUserContext.student_name,
    worry_tag_filter: worry_tag_filter || currentUserContext.worry_tag_filter
  };
  console.log('사용자 컨텍스트 업데이트:', currentUserContext);
};

/**
 * 현재 사용자 컨텍스트 가져오기
 */
export const getUserContext = () => {
  return { ...currentUserContext };
};

/**
 * 컨텍스트를 활용한 간편한 상담 메시지 전송
 * 이전에 설정된 사용자 정보를 자동으로 활용
 */
export const sendCounselingMessageWithContext = async (message) => {
  const context = getUserContext();
  return sendCounselingMessage(message, {
    student_name: context.student_name,
    worry_tag_filter: context.worry_tag_filter
  });
};

/**
 * 사용자 정보 초기화 (새 세션 시작 시 사용)
 */
export const clearUserContext = () => {
  currentUserContext = {
    student_name: null,
    worry_tag_filter: null
  };
  console.log('사용자 컨텍스트 초기화됨');
};