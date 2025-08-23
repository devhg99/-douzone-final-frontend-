// src/pages/LifeRecord/LifeRecordPage.jsx
import React, { useEffect, useState } from "react";

import StudentSelectSection from "./sections/StudentSelectSection";
import SummarySection from "./sections/SummarySection";
import CommentEditorSection from "./sections/CommentEditorSection";
import ActionBar from "./sections/ActionBar";

export default function LifeRecordPage() {
  // --- 상태 ----------------------------------------------------
  const [students, setStudents] = useState([]);    // 드롭다운 옵션
  const [studentId, setStudentId] = useState("");  // 선택 학생 id
  const [summary, setSummary] = useState(null);    // 요약(출결/성적/행동)
  const [comment, setComment] = useState("");      // 코멘트
  const [generating, setGenerating] = useState(false);
  const actionsEnabled = comment.trim().length > 0;

  // --- 초기 로딩: 학생 목록 가져오기 (TODO: API 연동) -----------
  useEffect(() => {
    // TODO: 백엔드 GET /api/students?grade=6&class_no=2
    // 아래는 데모 데이터
    setStudents([
      { label: "김민수", value: "S001" },
      { label: "이수진", value: "S002" },
      { label: "박준호", value: "S003" },
    ]);
  }, []);

  // --- 학생 선택 시: 요약 불러오기 ------------------------------
  const handleStudentChange = async (id) => {
    setStudentId(id);
    setComment(""); // 학생 바뀌면 코멘트 초기화

    if (!id) {
      setSummary(null);
      return;
    }

    // TODO: 백엔드 GET /api/students/{id}/summary?year=YYYY&semester=N
    // 아래는 데모 데이터
    setSummary({
      attendance: "결석 0, 지각 1(7월)",
      grades: "국어 92 / 수학 88 / 영어 90",
      behavior: "협동성 우수, 성실함",
    });
  };

  // --- 코멘트 생성 ----------------------------------------------
  const handleGenerate = async () => {
    if (!studentId) return;
    setGenerating(true);
    try {
      // TODO: 백엔드 POST /api/school-report/{studentId}/comment/generate
      const text = "책임감 있고 협업을 잘하며 학습태도가 성실합니다."; // 데모
      setComment(text);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="w-full">
      {/* 헤더와 폭을 맞춤 (Header가 1124px 컨테이너 사용) */}
      <div className="mx-auto max-w-[1124px] space-y-6">
        {/* 상단 2열 그리드: 좌(학생선택), 우(요약) */}
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-4">
            <StudentSelectSection
              value={studentId}
              onChange={handleStudentChange}
              options={students}
              showGenerateButton={false} // 시안상 상단 버튼 숨김
              // onGenerate={handleGenerate} // (상단에 버튼 쓰려면 주석 해제)
              // canGenerate={!!studentId}
              // generating={generating}
            />
          </div>

          <div className="col-span-12 lg:col-span-8">
            {/* SummarySection은 '빈 상태에서도 3행 고정 + 안내문'이 나오도록 수정된 버전이어야 합니다 */}
            <SummarySection data={summary} />
          </div>

          {/* 하단 전체 폭: 코멘트 에디터 (헤더 우측에 '코멘트생성' 배치) */}
          <div className="col-span-12">
          <CommentEditorSection
            value={comment}
            onChange={setComment}
            onGenerate={handleGenerate}
            canGenerate={!!studentId && !generating}
            generating={generating}
          />
          </div>
        </div>

        {/* 우측 정렬 액션바 (하단에 고정 느낌) */}
        <div className="sticky bottom-0">
          <div className="flex justify-end">
          <ActionBar
            onSave={() => {/* TODO */}}
            onPreview={() => {/* TODO */}}
            onPrint={() => {/* TODO */}}
            onRegenerate={handleGenerate}                 
            disabled={!actionsEnabled || generating}       
          />
          </div>
        </div>
      </div>
    </div>
  );
}
