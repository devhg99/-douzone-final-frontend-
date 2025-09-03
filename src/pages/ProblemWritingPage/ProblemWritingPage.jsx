import React, { useState } from 'react';
import { generateProblemSet } from '../../api/problemGeneration';
import './ProblemWritingPage.css';

export default function ProblemWritingPage() {
  // 상태 관리
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedUnits, setSelectedUnits] = useState([]);
  const [selectedSubUnits, setSelectedSubUnits] = useState([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [multipleChoiceCount, setMultipleChoiceCount] = useState(0);
  const [subjectiveCount, setSubjectiveCount] = useState(0);
  const [selectedQuestionTypes, setSelectedQuestionTypes] = useState([]);
  const [generatedTest, setGeneratedTest] = useState(null);

                // 과목 옵션
              const subjects = [
                { value: 'korean', label: '국어' },
                { value: 'math', label: '수학' },
                { value: 'english', label: '영어' },
                { value: 'social', label: '사회' },
                { value: 'science', label: '과학' }
              ];

                              // 단원 옵션 (과목별로 다르게 표시)
              const getUnits = (subject) => {
                const unitMap = {
                  math: [
                    { value: 'unit1', label: '1단원: 분수의 나눗셈' },
                    { value: 'unit2', label: '2단원: 소수의 나눗셈' },
                    { value: 'unit3', label: '3단원: 공간과 입체' },
                    { value: 'unit4', label: '4단원: 비례식과 비례배분' },
                    { value: 'unit5', label: '5단원: 원의 넓이' },
                    { value: 'unit6', label: '6단원: 원기둥, 원뿔, 구' }
                  ],
                  korean: [
                    { value: 'unit1', label: '1단원: 읽기' },
                    { value: 'unit2', label: '2단원: 쓰기' },
                    { value: 'unit3', label: '3단원: 문법' },
                    { value: 'unit4', label: '4단원: 문학' }
                  ],
                  english: [
                    { value: 'unit1', label: '1단원: Speaking' },
                    { value: 'unit2', label: '2단원: Reading' },
                    { value: 'unit3', label: '3단원: Writing' },
                    { value: 'unit4', label: '4단원: Grammar' }
                  ],
                  science: [
                    { value: 'unit1', label: '1단원: 물리' },
                    { value: 'unit2', label: '2단원: 화학' },
                    { value: 'unit3', label: '3단원: 생물' },
                    { value: 'unit4', label: '4단원: 지구과학' }
                  ],
                  social: [
                    { value: 'unit1', label: '1단원: 역사' },
                    { value: 'unit2', label: '2단원: 지리' },
                    { value: 'unit3', label: '3단원: 정치' },
                    { value: 'unit4', label: '4단원: 경제' }
                  ]
                };
                return unitMap[subject] || [];
              };

              // 소단원 옵션 (수학 1단원만 구현)
              const getSubUnits = (subject, unit) => {
                if (subject === 'math' && unit === 'unit1') {
                  return [
                    { value: 'sub1', label: '1. 분수 ÷ 자연수' },
                    { value: 'sub2', label: '2. 자연수 ÷ 분수' },
                    { value: 'sub3', label: '3. 분수 ÷ 분수' }
                  ];
                }
                return [];
              };

  // 난이도 옵션
  const difficulties = [
    { value: 'easy', label: '하', color: 'text-green-600' },
    { value: 'medium', label: '중', color: 'text-yellow-600' },
    { value: 'hard', label: '상', color: 'text-red-600' }
  ];

                // 문제 유형 옵션
              const questionTypes = [
                { value: 'basic', label: '기본 개념 문제' },
                { value: 'application', label: '실생활 응용 문제' },
                { value: 'critical', label: '비판적 사고 문제' },
                { value: 'creative', label: '창의적 해결 문제' }
              ];

  // 문제지 생성 함수
  const generateTest = async () => {
    if (!selectedSubject || selectedUnits.length === 0 || !selectedDifficulty) {
      alert('과목, 단원, 난이도를 선택해주세요.');
      return;
    }

    if (multipleChoiceCount === 0 && subjectiveCount === 0) {
      alert('객관식 또는 주관식 문제 수를 선택해주세요.');
      return;
    }

    try {
      // 로딩 상태 시작
      setGeneratedTest({ loading: true, content: '문제지를 생성하고 있습니다...' });

      // API 호출을 위한 설정 객체 생성
      const settings = {
        subject: subjects.find(s => s.value === selectedSubject)?.label || selectedSubject,
        units: selectedUnits,
        sub_units: selectedSubUnits,
        difficulty: difficulties.find(d => d.value === selectedDifficulty)?.label || selectedDifficulty,
        multiple_choice_count: multipleChoiceCount,
        subjective_count: subjectiveCount,
        question_types: selectedQuestionTypes
      };

      // API 호출
      const response = await generateProblemSet(settings);
      
      if (response.success) {
        setGeneratedTest({
          loading: false,
          content: response.data.problem_content,
          settings: response.data.settings_used
        });
      } else {
        setGeneratedTest({
          loading: false,
          content: '문제지 생성에 실패했습니다. 다시 시도해주세요.',
          error: true
        });
      }
    } catch (error) {
      console.error('문제지 생성 오류:', error);
      setGeneratedTest({
        loading: false,
        content: '문제지 생성 중 오류가 발생했습니다. 다시 시도해주세요.',
        error: true
      });
    }
  };

  // 문제지 내용 포맷팅 함수 - 단순화
  const formatProblemContent = (content) => {
    if (!content) return '';
    
    // 줄바꿈으로 분리하여 각 줄을 div로 표시
    const lines = content.split('\n');
    const formattedLines = [];
    
    // 과목 제목 추가 (가장 첫 번째에)
    const subjectTitle = selectedSubject === 'math' ? '수학' : 
                        selectedSubject === 'korean' ? '국어' :
                        selectedSubject === 'english' ? '영어' :
                        selectedSubject === 'social' ? '사회' :
                        selectedSubject === 'science' ? '과학' : '문제지';
    
    formattedLines.push(
      <div key="subject-title" className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-800">{subjectTitle}</h1>
      </div>
    );
    
    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      
      if (trimmedLine.startsWith('[') && trimmedLine.endsWith(']')) {
        // 섹션 제목 (예: [객관식 문제], [주관식 문제])
        formattedLines.push(
          <div key={index} className="mb-6">
            <h3 className="text-xl font-bold text-[#2E86C1] mb-4 pb-2 border-b-2 border-[#2E86C1]">
              {trimmedLine.replace(/[[\]]/g, '')}
            </h3>
          </div>
        );
      } else if (trimmedLine.startsWith('답:')) {
        // 답안 표시 - "답:" 문구를 네모박스 안으로 이동
        formattedLines.push(
          <div key={index} className="mt-4">
            {/* 풀이과정과 답을 적는 통합 칸 */}
            <div className="border-2 border-gray-300 rounded-lg p-4 bg-white">
              <div className="min-h-[120px]">
                <div className="font-semibold text-gray-800 mb-2">답:</div>
                {/* 풀이과정과 답을 적는 공간 */}
              </div>
            </div>
          </div>
        );
      } else if (trimmedLine && !trimmedLine.startsWith('#')) {
        // 일반 텍스트 (빈 줄이 아닌 경우)
        formattedLines.push(
          <div key={index} className="mb-2 text-gray-700 leading-relaxed">
            {trimmedLine}
          </div>
        );
      } else if (trimmedLine === '') {
        // 빈 줄
        formattedLines.push(<div key={index} className="mb-2"></div>);
      }
    });
    
    return formattedLines;
  };

  // 문제 유형 토글 함수
  const toggleQuestionType = (type) => {
    setSelectedQuestionTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  return (
    <div className="px-6 pb-6 bg-gray-50 min-h-screen">
      {/* 헤더 */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900">문제 생성</h1>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-8">
        {/* 왼쪽: 통합된 설정 영역 */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">문제 출제 설정</h2>
            </div>

                        <div className="space-y-4">
              {/* 과목 선택 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  과목 선택
                </label>
                                  <select
                    value={selectedSubject}
                    onChange={(e) => {
                      setSelectedSubject(e.target.value);
                      setSelectedUnits([]);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2E86C1] focus:border-transparent transition-colors"
                  >
                    {subjects.map((subject) => (
                      <option key={subject.value} value={subject.value}>
                        {subject.label}
                      </option>
                    ))}
                  </select>
              </div>

              {/* 단원 선택 */}
              {selectedSubject && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    단원 선택
                  </label>
                  <select
                    value=""
                    onChange={(e) => {
                      if (e.target.value && !selectedUnits.find(unit => unit.value === e.target.value)) {
                        const selectedUnit = getUnits(selectedSubject).find(unit => unit.value === e.target.value);
                        setSelectedUnits([...selectedUnits, selectedUnit]);
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2E86C1] focus:border-transparent transition-colors"
                  >
                    <option value="" style={{display: 'none'}}>단원을 선택하세요</option>
                    {getUnits(selectedSubject)
                      .filter(unit => !selectedUnits.find(selected => selected.value === unit.value))
                      .map((unit) => (
                        <option key={unit.value} value={unit.value}>
                          {unit.label}
                        </option>
                      ))}
                  </select>
                  
                  {/* 선택된 단원 태그들 */}
                  {selectedUnits.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {selectedUnits.map((unit, index) => (
                        <div
                          key={unit.value}
                          className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-2 rounded-md border border-blue-200"
                        >
                          <span className="text-sm font-medium">{unit.label}</span>
                          <button
                            onClick={() => {
                              setSelectedUnits(selectedUnits.filter((_, i) => i !== index));
                              setSelectedSubUnits([]);
                            }}
                            className="w-5 h-5 rounded-full bg-blue-200 hover:bg-blue-300 flex items-center justify-center text-blue-600 hover:text-blue-700 transition-colors"
                          >
                            <span className="text-xs font-bold">×</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 소단원 선택 (수학 1단원만) */}
              {selectedSubject === 'math' && selectedUnits.some(unit => unit.value === 'unit1') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    소단원 선택
                  </label>
                  <select
                    value=""
                    onChange={(e) => {
                      if (e.target.value && !selectedSubUnits.find(subUnit => subUnit.value === e.target.value)) {
                        const selectedSubUnit = getSubUnits('math', 'unit1').find(subUnit => subUnit.value === e.target.value);
                        setSelectedSubUnits([...selectedSubUnits, selectedSubUnit]);
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2E86C1] focus:border-transparent transition-colors"
                  >
                    <option value="" style={{display: 'none'}}>소단원을 선택하세요</option>
                    {getSubUnits('math', 'unit1')
                      .filter(subUnit => !selectedSubUnits.find(selected => selected.value === subUnit.value))
                      .map((subUnit) => (
                        <option key={subUnit.value} value={subUnit.value}>
                          {subUnit.label}
                        </option>
                      ))}
                  </select>
                  
                  {/* 선택된 소단원 태그들 */}
                  {selectedSubUnits.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {selectedSubUnits.map((subUnit, index) => (
                        <div
                          key={subUnit.value}
                          className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-2 rounded-md border border-green-200"
                        >
                          <span className="text-sm font-medium">{subUnit.label}</span>
                          <button
                            onClick={() => setSelectedSubUnits(selectedSubUnits.filter((_, i) => i !== index))}
                            className="w-5 h-5 rounded-full bg-green-200 hover:bg-green-300 flex items-center justify-center text-green-600 hover:text-green-700 transition-colors"
                          >
                            <span className="text-xs font-bold">×</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 난이도 선택 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  난이도 설정
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {difficulties.map((difficulty) => (
                    <button
                      key={difficulty.value}
                      onClick={() => setSelectedDifficulty(difficulty.value)}
                      className={`p-3 rounded-md border transition-all duration-200 text-center ${
                        selectedDifficulty === difficulty.value
                          ? 'border-[#2E86C1] bg-[#2E86C1] text-white shadow-md'
                          : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                      }`}
                    >
                      <span className={`text-sm font-semibold ${
                        selectedDifficulty === difficulty.value ? 'text-white' : difficulty.color
                      }`}>
                        {difficulty.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 문제 수 선택 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  문제 구성
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {/* 객관식 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      객관식 문제
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={multipleChoiceCount || ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '') {
                          setMultipleChoiceCount(0);
                        } else {
                          const numValue = parseInt(value);
                          if (!isNaN(numValue) && numValue >= 0) {
                            setMultipleChoiceCount(numValue);
                          }
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2E86C1] focus:border-transparent transition-colors"
                      placeholder="0"
                    />
                  </div>

                  {/* 주관식 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      주관식 문제
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={subjectiveCount || ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '') {
                          setSubjectiveCount(0);
                        } else {
                          const numValue = parseInt(value);
                          if (!isNaN(numValue) && numValue >= 0) {
                            setSubjectiveCount(numValue);
                          }
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2E86C1] focus:border-transparent transition-colors"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>

              {/* 문제 유형 선택 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  문제 유형
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {questionTypes.map((type) => (
                    <button
                      key={type.value}
                      onClick={() => toggleQuestionType(type.value)}
                      className={`p-3 rounded-md border transition-all duration-200 text-left text-sm ${
                        selectedQuestionTypes.includes(type.value)
                          ? 'border-[#2E86C1] bg-[#2E86C1] text-white shadow-md'
                          : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            {/* 문제지 생성 버튼 */}
            <button
              onClick={generateTest}
              className="w-full bg-[#2E86C1] text-white py-3 px-4 rounded-md hover:bg-[#2874A6] focus:outline-none focus:ring-2 focus:ring-[#2E86C1] focus:ring-offset-2 transition-colors font-semibold mt-6"
            >
              문제지 생성하기
            </button>
          </div>
        </div>

                {/* 오른쪽: 문제지 미리보기 */}
        <div className="lg:col-span-7">
          {generatedTest ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-6">
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">생성된 문제지</h3>
              </div>
              
              {/* 로딩 상태 */}
              {generatedTest.loading && (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2E86C1] mx-auto mb-4"></div>
                  <p className="text-gray-600">{generatedTest.content}</p>
                </div>
              )}
              
              {/* 에러 상태 */}
              {!generatedTest.loading && generatedTest.error && (
                <div className="text-center py-8">
                  <div className="text-red-500 text-6xl mb-4">⚠️</div>
                  <p className="text-red-600 font-medium">{generatedTest.content}</p>
                  <button 
                    onClick={generateTest}
                    className="mt-4 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition-colors"
                  >
                    다시 시도
                  </button>
                </div>
              )}
              
                                {/* 성공적으로 생성된 문제지 */}
                  {!generatedTest.loading && !generatedTest.error && (
                    <>

                  {/* 생성된 문제지 내용 */}
                  <div className="mb-6">
                    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                      <div className="prose max-w-none text-gray-800">
                        {formatProblemContent(generatedTest.content)}
                      </div>
                    </div>
                  </div>

                  {/* 문제지 액션 버튼 */}
                  <div className="space-y-3">
                    <button className="w-full bg-[#2E86C1] hover:bg-[#2874A6] text-white py-3 px-4 rounded-md transition-colors font-semibold shadow-sm hover:shadow-md">
                      PDF 다운로드
                    </button>
                    <button className="w-full bg-gray-600 hover:bg-gray-700 text-white py-3 px-4 rounded-md transition-colors font-semibold shadow-sm hover:shadow-md">
                      문제 편집
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-6">
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">📝</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">문제지 미리보기</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  왼쪽에서 설정을 완료하고<br />
                  <span className="font-semibold text-[#2E86C1]">문제지 생성하기</span> 버튼을 클릭하면<br />
                  여기에 미리보기가 표시됩니다.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 