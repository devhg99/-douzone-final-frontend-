const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/v1';

export const generateProblemSet = async (settings, onChunk, onComplete, onError) => {
  try {
    // POST 요청으로 스트리밍 시작
    const response = await fetch(`${API_BASE_URL}/problem-generation/generate-streaming`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(settings),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // 스트리밍 응답 처리
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    try {
      let isReading = true;
      while (isReading) {
        const { done, value } = await reader.read();
        
        if (done) {
          isReading = false;
          break;
        }

        // 데이터 디코딩
        buffer += decoder.decode(value, { stream: true });
        
        // SSE 형식 파싱 (data: 로 시작하는 라인들)
        const lines = buffer.split('\n');
        buffer = lines.pop(); // 마지막 불완전한 라인은 버퍼에 보관

        for (const line of lines) {
          if (line.trim() === '') continue;
          
          if (line.startsWith('data: ')) {
            try {
              const jsonData = line.slice(6); // 'data: ' 제거
              const data = JSON.parse(jsonData);
              
              // 이벤트 타입별 처리
              if (data.type === 'start') {
                console.log('스트리밍 시작:', data.message);
              } else if (data.type === 'content' && data.chunk) {
                // 디버깅: 받은 청크 확인
                console.log('🔍 받은 청크:', JSON.stringify(data.chunk));
                console.log('🔍 청크 길이:', data.chunk.length);
                console.log('🔍 청크 내용:', data.chunk);
                
                // 실시간 콘텐츠 전달
                onChunk(data.chunk);
              } else if (data.type === 'done') {
                // 스트리밍 완료
                onComplete(data);
                return;
              } else if (data.type === 'error') {
                // 에러 발생
                onError(new Error(data.message));
                return;
              }
            } catch (parseError) {
              console.warn('JSON 파싱 오류:', parseError, 'Line:', line);
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }

  } catch (error) {
    console.error('문제지 생성 중 오류 발생:', error);
    onError(error);
  }
}; 