// chatbot_counseling.js — 수정본
const API_COUNCELING_URL = process.env.REACT_APP_API_COUNSELING_URL; // env 이름 확인: REACT_APP_API_COUNSELING_URL

/**
 * 상담(Milvus RAG) 챗봇과 대화하는 API 함수.
 * messageOrPayload: string 또는 object 둘 다 허용
 */
export const sendCounselingMessage = async (messageOrPayload) => {
  try {
    console.log('=== 상담 챗봇 API 호출 시작 ===');
    console.log('API_COUNCELING_URL:', API_COUNCELING_URL);

    const apiUrl = `${API_COUNCELING_URL.replace(/\/$/, '')}/gemini/master-chat`; // 중복 슬래시 방지
    console.log('전체 API URL:', apiUrl);

    // 유연한 입력 처리:
    // - 문자열이 들어오면 기본 매핑을 사용
    // - 객체가 들어오면 그대로 사용 (백엔드 스키마에 맞게 보낼 수 있게)
    let requestBody;
    if (typeof messageOrPayload === 'string') {
      // TODO: 필요하면 여기서 student_name이나 use_rag를 동적으로 설정하도록 변경하세요.
      requestBody = {
        query: messageOrPayload,
        use_rag: true,
        worry_tag_filter: "용기",
        student_name: "신수연"
      };
    } else if (typeof messageOrPayload === 'object' && messageOrPayload !== null) {
      // 전달된 객체를 우선 사용. 필요한 필드가 빠져있다면 백엔드에서 400을 반환할 것임.
      requestBody = messageOrPayload;
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
