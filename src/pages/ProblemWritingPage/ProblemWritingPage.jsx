import React, { useState } from 'react';
import './ProblemWritingPage.css';

export default function ProblemWritingPage() {
  // 상태 관리
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedUnits, setSelectedUnits] = useState([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [multipleChoiceCount, setMultipleChoiceCount] = useState(0);
  const [subjectiveCount, setSubjectiveCount] = useState(0);
  const [selectedQuestionTypes, setSelectedQuestionTypes] = useState([]);
  const [generatedTest, setGeneratedTest] = useState(null);

  // 과목 옵션
  const subjects = [
    { value: 'math', label: '수학' },
    { value: 'korean', label: '국어' },
    { value: 'english', label: '영어' },
    { value: 'science', label: '과학' },
    { value: 'social', label: '사회' }
  ];

  // 단원 옵션 (과목별로 다르게 표시)
  const getUnits = (subject) => {
    const unitMap = {
      math: [
        { value: 'unit1', label: '1단원: 수와 연산' },
        { value: 'unit2', label: '2단원: 도형' },
        { value: 'unit3', label: '3단원: 측정' },
        { value: 'unit4', label: '4단원: 통계' }
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
  const generateTest = () => {
    if (!selectedSubject || selectedUnits.length === 0 || !selectedDifficulty) {
      alert('과목, 단원, 난이도를 선택해주세요.');
      return;
    }

    if (multipleChoiceCount === 0 && subjectiveCount === 0) {
      alert('객관식 또는 주관식 문제 수를 선택해주세요.');
      return;
    }

    const test = {
      subject: subjects.find(s => s.value === selectedSubject)?.label,
      units: selectedUnits.map(unit => unit.label),
      difficulty: difficulties.find(d => d.value === selectedDifficulty)?.label,
      multipleChoice: multipleChoiceCount,
      subjective: subjectiveCount,
      questionTypes: selectedQuestionTypes.map(type => 
        questionTypes.find(qt => qt.value === type)?.label
      ),
      timestamp: new Date().toLocaleString('ko-KR')
    };

    setGeneratedTest(test);
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
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">문제 생성</h1>
      </div>

                        {/* 메인 콘텐츠 */}
                  <div className="grid grid-cols-1 lg:grid-cols-10 gap-8">
                    {/* 왼쪽: 통합된 설정 영역 */}
                    <div className="lg:col-span-3">
                      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">문제 출제 설정</h2>
              <p className="text-gray-600">학생 맞춤형 문제지를 위한 상세 설정을 구성하세요.</p>
            </div>

            <div className="space-y-4">
              {/* 과목 선택 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                  과목 선택
                </label>
                                  <select
                    value={selectedSubject}
                    onChange={(e) => {
                      setSelectedSubject(e.target.value);
                      setSelectedUnits([]);
                    }}
                    className="w-full p-3 rounded-lg border-2 border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 bg-white text-gray-900 font-medium"
                  >
                    <option value="">과목을 선택하세요</option>
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
                  <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">
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
                    className="w-full p-3 rounded-lg border-2 border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 bg-white text-gray-900 font-medium"
                  >
                    <option value="">단원을 선택하세요</option>
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
                          className="flex items-center gap-2 bg-indigo-100 text-indigo-700 px-3 py-2 rounded-lg border border-indigo-200"
                        >
                          <span className="text-sm font-medium">{unit.label}</span>
                          <button
                            onClick={() => setSelectedUnits(selectedUnits.filter((_, i) => i !== index))}
                            className="w-5 h-5 rounded-full bg-indigo-200 hover:bg-indigo-300 flex items-center justify-center text-indigo-600 hover:text-indigo-700 transition-colors"
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
                <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                  난이도 설정
                </label>
                <div className="flex gap-2">
                  {difficulties.map((difficulty) => (
                    <button
                      key={difficulty.value}
                      onClick={() => setSelectedDifficulty(difficulty.value)}
                      className={`flex-1 p-3 rounded-lg border-2 transition-all duration-200 ${
                        selectedDifficulty === difficulty.value
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-700 shadow-md'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <span className={`text-base font-bold ${difficulty.color}`}>
                        {difficulty.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 문제 수 선택 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                  문제 구성
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {/* 객관식 */}
                  <div className="bg-gray-50 rounded-lg p-3">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      객관식 문제
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setMultipleChoiceCount(Math.max(0, multipleChoiceCount - 1))}
                        className="w-7 h-7 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-600 font-bold transition-colors text-sm"
                      >
                        -
                      </button>
                      <span className="w-10 text-center text-base font-bold text-gray-900">
                        {multipleChoiceCount}
                      </span>
                      <button
                        onClick={() => setMultipleChoiceCount(multipleChoiceCount + 1)}
                        className="w-7 h-7 rounded-full bg-indigo-500 hover:bg-indigo-600 flex items-center justify-center text-white font-bold transition-colors text-sm"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* 주관식 */}
                  <div className="bg-gray-50 rounded-lg p-3">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      주관식 문제
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSubjectiveCount(Math.max(0, subjectiveCount - 1))}
                        className="w-7 h-7 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-600 font-bold transition-colors text-sm"
                      >
                        -
                      </button>
                      <span className="w-10 text-center text-base font-bold text-gray-900">
                        {subjectiveCount}
                      </span>
                      <button
                        onClick={() => setSubjectiveCount(subjectiveCount + 1)}
                        className="w-7 h-7 rounded-full bg-indigo-500 hover:bg-indigo-600 flex items-center justify-center text-white font-bold transition-colors text-sm"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* 문제 유형 선택 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                  문제 유형
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {questionTypes.map((type) => (
                    <button
                      key={type.value}
                      onClick={() => toggleQuestionType(type.value)}
                      className={`p-2 rounded-lg border-2 transition-all duration-200 text-left text-sm ${
                        selectedQuestionTypes.includes(type.value)
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-700 shadow-md'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
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
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 px-6 rounded-lg hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl text-lg font-bold mt-6"
            >
              🚀 문제지 생성하기
            </button>
          </div>
        </div>

        {/* 오른쪽: 문제지 미리보기 */}
        <div className="lg:col-span-7">
          {generatedTest ? (
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 sticky top-6">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">생성된 문제지</h3>
                <div className="w-12 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"></div>
              </div>
              
              {/* 문제지 정보 */}
              <div className="space-y-4 mb-6">
                                          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="text-sm font-semibold text-gray-600 uppercase tracking-wide">과목</span>
                              <span className="text-lg font-bold text-indigo-700">{generatedTest.subject}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-semibold text-gray-600 uppercase tracking-wide">단원</span>
                              <div className="flex flex-wrap gap-1">
                                {generatedTest.units.map((unit, index) => (
                                  <span key={index} className="text-sm font-bold text-indigo-700 bg-indigo-100 px-2 py-1 rounded">
                                    {unit}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>

                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-gray-600 uppercase tracking-wide">난이도</span>
                    <span className={`text-lg font-bold ${
                      generatedTest.difficulty === '하' ? 'text-green-600' :
                      generatedTest.difficulty === '중' ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {generatedTest.difficulty}
                    </span>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-gray-600 uppercase tracking-wide">객관식</span>
                      <span className="text-lg font-bold text-green-700">{generatedTest.multipleChoice}문제</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-gray-600 uppercase tracking-wide">주관식</span>
                      <span className="text-lg font-bold text-green-700">{generatedTest.subjective}문제</span>
                    </div>
                  </div>
                </div>

                {generatedTest.questionTypes.length > 0 && (
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4">
                    <span className="text-sm font-semibold text-gray-600 uppercase tracking-wide block mb-2">문제 유형</span>
                    <div className="flex flex-wrap gap-2">
                      {generatedTest.questionTypes.map((type, index) => (
                        <span key={index} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                          {type}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="text-center text-xs text-gray-500 bg-gray-50 rounded-lg p-3">
                  생성 시간: {generatedTest.timestamp}
                </div>
              </div>

              {/* 문제지 액션 버튼 */}
              <div className="space-y-3">
                <button className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white py-3 px-4 rounded-lg transition-all duration-200 font-semibold shadow-md hover:shadow-lg">
                  📥 PDF 다운로드
                </button>
                <button className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white py-3 px-4 rounded-lg transition-all duration-200 font-semibold shadow-md hover:shadow-lg">
                  ✏️ 문제 편집
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 sticky top-6">
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">📝</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">문제지 미리보기</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  왼쪽에서 설정을 완료하고<br />
                  <span className="font-semibold text-indigo-600">문제지 생성하기</span> 버튼을 클릭하면<br />
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