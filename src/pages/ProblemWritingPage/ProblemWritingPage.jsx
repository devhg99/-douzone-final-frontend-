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
  const [streamingContent, setStreamingContent] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);

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

  // 문제지 생성 함수 (스트리밍 방식)
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
      // 스트리밍 상태 초기화
      setIsStreaming(true);
      setStreamingContent('');
      setGeneratedTest({ loading: true, content: '' });

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

      // 스트리밍 콜백 함수들
      const onChunk = (chunk) => {
        // 디버깅: 받은 청크 확인
        console.log('🔍 UI에서 받은 청크:', JSON.stringify(chunk));
        console.log('🔍 청크 타입:', typeof chunk);
        console.log('🔍 청크 길이:', chunk.length);
        
        setStreamingContent(prev => {
          const newContent = prev + chunk;
          console.log('🔍 새로운 콘텐츠:', JSON.stringify(newContent));
          return newContent;
        });
      };

      const onComplete = (data) => {
        setIsStreaming(false);
        // 스트리밍 완료 시에도 같은 영역에서 자연스럽게 완성된 상태로 유지
        setGeneratedTest(prev => {
          const finalContent = streamingContent || prev.content || '';
          return {
            loading: false,
            content: finalContent,
            settings: settings
          };
        });
        console.log('스트리밍 완료:', data);
      };

      const onError = (error) => {
        setIsStreaming(false);
        setGeneratedTest({
          loading: false,
          content: '문제지 생성 중 오류가 발생했습니다. 다시 시도해주세요.',
          error: true
        });
        console.error('스트리밍 오류:', error);
      };

      // 스트리밍 API 호출
      await generateProblemSet(settings, onChunk, onComplete, onError);
      
    } catch (error) {
      console.error('문제지 생성 오류:', error);
      setIsStreaming(false);
      setGeneratedTest({
        loading: false,
        content: '문제지 생성 중 오류가 발생했습니다. 다시 시도해주세요.',
        error: true
      });
    }
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

      {/* 메인 콘텐츠 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* 왼쪽: 통합된 설정 영역 */}
        <div className="lg:col-span-3">
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg border border-gray-100 p-6">
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-800 mb-2">문제 출제 설정</h2>
              <p className="text-sm text-gray-600">과목, 단원, 난이도를 선택하여 맞춤형 문제지를 생성하세요</p>
            </div>

            <div className="space-y-6">
              {/* 과목 선택 */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  과목 선택
                </label>
                <select
                  value={selectedSubject}
                  onChange={(e) => {
                    setSelectedSubject(e.target.value);
                    setSelectedUnits([]);
                  }}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white hover:bg-gray-50"
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
                  <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
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
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white hover:bg-gray-50"
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
                    <div className="mt-4 flex flex-wrap gap-2">
                      {selectedUnits.map((unit, index) => (
                        <div
                          key={unit.value}
                          className="inline-flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 rounded-lg text-sm border border-green-200 shadow-sm"
                        >
                          <span className="font-medium">{unit.label}</span>
                          <button
                            onClick={() => {
                              setSelectedUnits(selectedUnits.filter((_, i) => i !== index));
                              setSelectedSubUnits([]);
                            }}
                            className="text-green-500 hover:text-green-700 transition-colors"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
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
                  <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
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
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white hover:bg-gray-50"
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
                    <div className="mt-4 flex flex-wrap gap-2">
                      {selectedSubUnits.map((subUnit, index) => (
                        <div
                          key={subUnit.value}
                          className="inline-flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-50 to-violet-50 text-purple-700 rounded-lg text-sm border border-purple-200 shadow-sm"
                        >
                          <span className="font-medium">{subUnit.label}</span>
                          <button
                            onClick={() => setSelectedSubUnits(selectedSubUnits.filter((_, i) => i !== index))}
                            className="text-purple-500 hover:text-purple-700 transition-colors"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 난이도 선택 */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                  난이도 설정
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {difficulties.map((difficulty) => (
                    <button
                      key={difficulty.value}
                      onClick={() => setSelectedDifficulty(difficulty.value)}
                      className={`p-4 rounded-lg border-2 transition-all duration-200 text-center font-semibold ${
                        selectedDifficulty === difficulty.value
                          ? 'border-amber-400 bg-white text-amber-600 shadow-lg transform scale-105'
                          : 'border-gray-200 hover:border-amber-300 hover:bg-amber-50 hover:shadow-md'
                      }`}
                    >
                      <span className={`text-sm ${
                        selectedDifficulty === difficulty.value ? 'text-amber-600' : difficulty.color
                      }`}>
                        {difficulty.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 문제 수 선택 */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                  문제 구성
                </label>
                <div className="grid grid-cols-2 gap-4">
                  {/* 객관식 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
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
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white hover:bg-gray-50"
                      placeholder="0"
                    />
                  </div>
                  
                  {/* 주관식 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
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
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white hover:bg-gray-50"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>

              {/* 문제 유형 선택 */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                  문제 유형
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {questionTypes.map((type) => (
                    <button
                      key={type.value}
                      onClick={() => toggleQuestionType(type.value)}
                      className={`p-4 rounded-lg border-2 transition-all duration-200 text-left text-sm font-medium ${
                        selectedQuestionTypes.includes(type.value)
                          ? 'border-teal-500 bg-white text-teal-600 shadow-lg transform scale-105'
                          : 'border-gray-200 hover:border-teal-300 hover:bg-teal-50 hover:shadow-md'
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
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-6 rounded-xl hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 mt-8"
            >
              <div className="flex items-center justify-center gap-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                문제지 생성하기
              </div>
            </button>
          </div>
        </div>

                {/* 오른쪽: 문제지 미리보기 */}
        <div className="lg:col-span-9">
          {generatedTest ? (
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg border border-gray-100 p-6 sticky top-6">
              
              {/* 실시간 스트리밍 콘텐츠 표시 */}
              {(isStreaming || (generatedTest && generatedTest.content)) && (
                <div className="mb-6">
                  <div className="text-left">
                    {/* 상태 표시 */}
                    <div className="mb-4">
                      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                        isStreaming 
                          ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200' 
                          : 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border border-green-200'
                      }`}>
                        <div className={`w-3 h-3 rounded-full ${
                          isStreaming 
                            ? 'bg-blue-500 animate-pulse' 
                            : 'bg-green-500'
                        }`}></div>
                        <span>
                          {isStreaming ? '생성중...' : '완료'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm min-h-[400px] max-h-[800px] overflow-y-auto">
                      <div className="prose max-w-none text-gray-800 whitespace-pre-wrap">
                        {streamingContent || generatedTest?.content}
                        {isStreaming && <span className="animate-pulse text-blue-500">|</span>}
                      </div>
                    </div>
                  </div>
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
              
            </div>
          ) : (
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg border border-gray-100 p-6 sticky top-6">
              
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-3">문제지 생성 준비</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  왼쪽에서 설정을 완료하고<br />
                  <span className="font-semibold text-emerald-600">문제지 생성하기</span> 버튼을 클릭하면<br />
                  여기에 문제지가 생성됩니다.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 