const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/v1';

export const generateProblemSet = async (settings) => {
  try {
    const response = await fetch(`${API_BASE_URL}/problem-generation/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(settings),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('문제지 생성 중 오류 발생:', error);
    throw error;
  }
}; 