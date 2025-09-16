import React, { useState, useEffect, useMemo } from 'react';
import './AttendancePage.css';
import { 
  fetchStudents, 
  fetchStudentsByClass, 
  fetchAllAttendance, 
  createOrUpdateAttendance,
  updateAttendance,
  deleteAttendance,
  fetchStudentAttendanceStats
} from '../../api/attendance';
import useUIStore from '../../store/useUIStore';

const AttendancePage = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('daily');
  const [students, setStudents] = useState([]);
  const [attendanceData, setAttendanceData] = useState({});
  const [attendanceStats, setAttendanceStats] = useState([]); // 전체현황용 통계 데이터
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pendingChanges, setPendingChanges] = useState({}); // 임시 저장용
  const [editingStudents, setEditingStudents] = useState({}); // 수정 모드 상태
  
  // 챗봇 연동을 위한 상태 관리
  const { 
    shouldRefreshAttendance, 
    resetAttendanceRefresh,
    shouldRefreshAttendanceStats,
    resetAttendanceStatsRefresh
  } = useUIStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('name'); // 'name', 'absent', 'late', 'early'

  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  const changeDate = (direction) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + direction);
    setSelectedDate(newDate);
  };

  // 드롭다운 선택 시 임시 저장 (DB 저장 X)
  const handleStatusSelect = (studentId, status) => {
    const dateKey = formatDate(selectedDate);
    
    if (status === '출석체크하기') {
      // 출석체크하기 선택 시 데이터에서 제거
      setAttendanceData(prev => {
        const newData = { ...prev };
        delete newData[`${studentId}_${dateKey}`];
        return newData;
      });
      setPendingChanges(prev => {
        const newData = { ...prev };
        delete newData[`${studentId}_${dateKey}`];
        return newData;
      });
    } else if (status === '출석') {
      // 출석은 바로 DB에 저장
      handleSaveAttendance(studentId, status, '');
    } else {
      // 지각/결석/조퇴는 임시 저장만
      const pendingKey = `${studentId}_${dateKey}`;
      setPendingChanges(prev => ({
        ...prev,
        [pendingKey]: {
          studentId,
          date: dateKey,
          status,
          reason: ''
        }
      }));
    }
  };

  // 사유 입력 시 임시 저장 업데이트
  const handleReasonChange = (studentId, reason) => {
    const dateKey = formatDate(selectedDate);
    const pendingKey = `${studentId}_${dateKey}`;
    
    setPendingChanges(prev => ({
      ...prev,
      [pendingKey]: {
        ...prev[pendingKey],
        reason
      }
    }));
  };

  // 수정 모드 토글
  const toggleEditMode = (studentId) => {
    const dateKey = formatDate(selectedDate);
    const editKey = `${studentId}_${dateKey}`;
    
    setEditingStudents(prev => ({
      ...prev,
      [editKey]: !prev[editKey]
    }));
  };

  // 실제 DB에 저장
  const handleSaveAttendance = async (studentId, status, reason = '') => {
    const dateKey = formatDate(selectedDate);
    
    try {
      setLoading(true);
      setError(null);
      
      const attendancePayload = {
        student_id: studentId,
        date: dateKey,
        status: status,
        reason: reason || null
      };

      // 기존 출석 기록이 있는지 확인
      const existingRecord = attendanceData[`${studentId}_${dateKey}`];
      
      if (existingRecord && existingRecord.id) {
        // 기존 기록 업데이트
        const response = await updateAttendance(existingRecord.id, attendancePayload);
        console.log('출석 상태 업데이트 성공:', response);
      } else {
        // 새 기록 생성
        const response = await createOrUpdateAttendance(attendancePayload);
        attendancePayload.id = response.data.id;
        console.log('출석 상태 생성 성공:', response);
      }

      // 로컬 상태 업데이트
      setAttendanceData(prev => ({
        ...prev,
        [`${studentId}_${dateKey}`]: {
          id: attendancePayload.id || existingRecord?.id,
          studentId,
          date: dateKey,
          status,
          reason
        }
      }));

      // 임시 저장에서 제거
      setPendingChanges(prev => {
        const newData = { ...prev };
        delete newData[`${studentId}_${dateKey}`];
        return newData;
      });

      // 수정 모드 해제
      setEditingStudents(prev => {
        const newData = { ...prev };
        delete newData[`${studentId}_${dateKey}`];
        return newData;
      });

    } catch (error) {
      console.error('출석 상태 저장 실패:', error);
      setError('출석 상태 저장에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 필터링된 학생 목록 (일별현황용 - 메모이제이션으로 최적화)
  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const matchesSearch = student.student_name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesClass = selectedClass === 'all' || student.class_id === selectedClass;
      const dateKey = formatDate(selectedDate);
      const attendance = attendanceData[`${student.id}_${dateKey}`];
      const pending = pendingChanges[`${student.id}_${dateKey}`];
      const currentStatus = attendance?.status || pending?.status || '출석체크하기';
      const matchesStatus = selectedStatus === 'all' || currentStatus === selectedStatus;
      
      return matchesSearch && matchesClass && matchesStatus;
    }).sort((a, b) => {
      // 가나다순 정렬 (한글 이름 기준)
      return a.student_name.localeCompare(b.student_name, 'ko-KR');
    });
  }, [students, searchTerm, selectedClass, selectedStatus, attendanceData, pendingChanges, selectedDate]);

  // 필터링된 학생 목록 (전체현황용 - 통계 데이터 기반)
  const filteredStatsStudents = useMemo(() => {
    return attendanceStats.filter(stat => {
      const matchesSearch = stat.student_name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesClass = selectedClass === 'all' || stat.class_id === selectedClass;
      
      return matchesSearch && matchesClass;
    }).sort((a, b) => {
      // 정렬 기준에 따른 정렬
      switch (sortBy) {
        case 'absent':
          return b.absent_count - a.absent_count; // 내림차순
        case 'late':
          return b.late_count - a.late_count; // 내림차순
        case 'early':
          return b.early_count - a.early_count; // 내림차순
        case 'name':
        default:
          return a.student_name.localeCompare(b.student_name, 'ko-KR'); // 가나다순
      }
    });
  }, [attendanceStats, searchTerm, selectedClass, sortBy]);

  // 통계 계산 (메모이제이션으로 최적화)
  const stats = useMemo(() => {
    const total = students.length;
    const dateKey = formatDate(selectedDate);
    
    const present = students.filter(student => {
      const attendance = attendanceData[`${student.id}_${dateKey}`];
      const pending = pendingChanges[`${student.id}_${dateKey}`];
      return (attendance?.status || pending?.status) === '출석';
    }).length;
    
    const late = students.filter(student => {
      const attendance = attendanceData[`${student.id}_${dateKey}`];
      const pending = pendingChanges[`${student.id}_${dateKey}`];
      return (attendance?.status || pending?.status) === '지각';
    }).length;
    
    const absent = students.filter(student => {
      const attendance = attendanceData[`${student.id}_${dateKey}`];
      const pending = pendingChanges[`${student.id}_${dateKey}`];
      return (attendance?.status || pending?.status) === '결석';
    }).length;
    
    const early = students.filter(student => {
      const attendance = attendanceData[`${student.id}_${dateKey}`];
      const pending = pendingChanges[`${student.id}_${dateKey}`];
      return (attendance?.status || pending?.status) === '조퇴';
    }).length;

    return { total, present, late, absent, early };
  }, [students, attendanceData, pendingChanges, selectedDate]);

  // 전체현황용 통계 계산 (전체 기간 합계)
  const summaryStats = useMemo(() => {
    const totalAbsent = attendanceStats.reduce((sum, stat) => sum + stat.absent_count, 0);
    const totalLate = attendanceStats.reduce((sum, stat) => sum + stat.late_count, 0);
    const totalEarly = attendanceStats.reduce((sum, stat) => sum + stat.early_count, 0);

    return {
      totalAbsent,
      totalLate,
      totalEarly
    };
  }, [attendanceStats]);

  // 학생 목록 로드
  const loadStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetchStudents();
      if (response.success) {
        setStudents(response.data);
      } else {
        setError('학생 목록을 불러오는데 실패했습니다.');
      }
    } catch (error) {
      console.error('학생 목록 로드 실패:', error);
      setError('학생 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 출석 데이터 로드 (자연스러운 업데이트)
  const loadAttendanceData = async (isRefresh = false) => {
    try {
      // 초기 로드 시에만 전체 로딩 표시
      if (!isRefresh) {
        setLoading(true);
      }
      setError(null);
      
      const response = await fetchAllAttendance();
      if (response.success) {
        // 출석 데이터를 키-값 형태로 변환
        const attendanceMap = {};
        response.data.forEach(record => {
          const key = `${record.student_id}_${record.date}`;
          attendanceMap[key] = {
            id: record.id,
            studentId: record.student_id,
            date: record.date,
            status: record.status,
            reason: record.reason
          };
        });
        
        // 자연스러운 업데이트: 기존 데이터와 병합
        setAttendanceData(prev => ({
          ...prev,
          ...attendanceMap
        }));
      } else {
        setError('출석 데이터를 불러오는데 실패했습니다.');
      }
    } catch (error) {
      console.error('출석 데이터 로드 실패:', error);
      setError('출석 데이터를 불러오는데 실패했습니다.');
    } finally {
      // 초기 로드 시에만 로딩 해제
      if (!isRefresh) {
        setLoading(false);
      }
    }
  };

  // 전체현황용 출석 통계 데이터 로드
  const loadAttendanceStats = async () => {
    try {
      console.log('전체현황 출석 통계 로드 시작');
      const response = await fetchStudentAttendanceStats();
      if (response.success) {
        console.log('전체현황 출석 통계 로드 성공:', response.data);
        setAttendanceStats(response.data);
      } else {
        console.error('전체현황 출석 통계 로드 실패:', response.error);
        setError('출석 통계를 불러오는데 실패했습니다.');
      }
    } catch (error) {
      console.error('전체현황 출석 통계 로드 실패:', error);
      setError('출석 통계를 불러오는데 실패했습니다.');
    }
  };

  useEffect(() => {
    loadStudents();
    loadAttendanceData();
    loadAttendanceStats(); // 전체현황용 통계 데이터 로드
  }, []);

  // 특정 학생의 출석 데이터만 업데이트 (깜빡임 방지)
  const updateSpecificAttendance = async (studentId, date) => {
    try {
      const response = await fetchAllAttendance();
      if (response.success) {
        // 해당 학생의 출석 데이터만 찾아서 업데이트
        const studentRecord = response.data.find(record => 
          record.student_id === studentId && record.date === date
        );
        
        if (studentRecord) {
          const key = `${studentId}_${date}`;
          const newAttendanceData = {
            id: studentRecord.id,
            studentId: studentRecord.student_id,
            date: studentRecord.date,
            status: studentRecord.status,
            reason: studentRecord.reason
          };
          
          // 해당 학생의 데이터만 업데이트
          setAttendanceData(prev => ({
            ...prev,
            [key]: newAttendanceData
          }));
        }
      }
    } catch (error) {
      console.error('특정 출석 데이터 업데이트 실패:', error);
    }
  };

  // 챗봇에서 출석 변경 시 자동 새로고침 (깜빡임 없는 즉시 업데이트)
  useEffect(() => {
    if (shouldRefreshAttendance) {
      console.log('챗봇에서 출석 변경 감지 - 즉시 데이터 업데이트');
      
      // 로딩 표시 없이 즉시 데이터 업데이트
      const updateData = async () => {
        try {
          const response = await fetchAllAttendance();
          if (response.success) {
            const attendanceMap = {};
            response.data.forEach(record => {
              const key = `${record.student_id}_${record.date}`;
              attendanceMap[key] = {
                id: record.id,
                studentId: record.student_id,
                date: record.date,
                status: record.status,
                reason: record.reason
              };
            });
            
            // 즉시 업데이트 (깜빡임 없음)
            setAttendanceData(prev => ({
              ...prev,
              ...attendanceMap
            }));
          }
        } catch (error) {
          console.error('즉시 업데이트 실패:', error);
        }
      };
      
      updateData();
      resetAttendanceRefresh(); // 트리거 리셋
    }
  }, [shouldRefreshAttendance, resetAttendanceRefresh]);

  // 챗봇에서 출석 변경 시 전체현황 통계도 자동 새로고침
  useEffect(() => {
    if (shouldRefreshAttendanceStats) {
      console.log('챗봇에서 출석 변경 감지 - 전체현황 통계 즉시 업데이트');
      
      // 로딩 표시 없이 즉시 통계 데이터 업데이트
      const updateStatsData = async () => {
        try {
          const response = await fetchStudentAttendanceStats();
          if (response.success) {
            console.log('전체현황 통계 즉시 업데이트 성공:', response.data);
            setAttendanceStats(response.data);
          } else {
            console.error('전체현황 통계 즉시 업데이트 실패:', response.error);
          }
        } catch (error) {
          console.error('전체현황 통계 즉시 업데이트 실패:', error);
        }
      };
      
      updateStatsData();
      resetAttendanceStatsRefresh(); // 트리거 리셋
    }
  }, [shouldRefreshAttendanceStats, resetAttendanceStatsRefresh]);

  return (
    <div className="attendance-page">
      {/* 로딩 상태 (자연스러운 업데이트 시에는 표시하지 않음) */}
      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>출석 데이터를 업데이트하는 중...</p>
          </div>
        </div>
      )}

      {/* 에러 상태 */}
      {error && (
        <div className="error-banner">
          <div className="error-content">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="15" y1="9" x2="9" y2="15"></line>
              <line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>
            <span>{error}</span>
            <button 
              className="error-retry-btn"
              onClick={() => {
                setError(null);
                loadStudents();
                loadAttendanceData();
              }}
            >
              다시 시도
            </button>
          </div>
        </div>
      )}

      {/* Control Panel Section */}
      <section className="control-section">
         <div className="control-header">
           <div className="control-left">
             <div className="view-tabs">
               <button 
                 className={`tab-button ${viewMode === 'daily' ? 'active' : ''}`}
                 onClick={() => setViewMode('daily')}
               >
                 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                   <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                   <line x1="16" y1="2" x2="16" y2="6"></line>
                   <line x1="8" y1="2" x2="8" y2="6"></line>
                   <line x1="3" y1="10" x2="21" y2="10"></line>
                 </svg>
                 일별 현황
               </button>
               <button 
                 className={`tab-button ${viewMode === 'overall' ? 'active' : ''}`}
                 onClick={() => setViewMode('overall')}
               >
                 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                   <path d="M3 3v18h18"></path>
                   <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"></path>
                 </svg>
                 전체 현황
               </button>
             </div>

             <div className="stats-cards-inline">
               {viewMode === 'daily' ? (
                 // 일별현황: 출석, 결석, 지각, 조퇴 모두 표시
                 <>
                   <div className="stat-card-inline present">
                     <div className="stat-icon-inline">
                       <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                         <polyline points="20,6 9,17 4,12"></polyline>
                       </svg>
                     </div>
                     <div className="stat-content-inline">
                       <div className="stat-value-inline">{stats.present}/{stats.total}</div>
                       <div className="stat-label-inline">출석</div>
                     </div>
                   </div>

                   <div className="stat-card-inline absent">
                     <div className="stat-icon-inline">
                       <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                         <circle cx="12" cy="12" r="10"></circle>
                         <line x1="15" y1="9" x2="9" y2="15"></line>
                         <line x1="9" y1="9" x2="15" y2="15"></line>
                       </svg>
                     </div>
                     <div className="stat-content-inline">
                       <div className="stat-value-inline">{stats.absent}</div>
                       <div className="stat-label-inline">결석</div>
                     </div>
                   </div>

                   <div className="stat-card-inline late">
                     <div className="stat-icon-inline">
                       <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                         <circle cx="12" cy="12" r="10"></circle>
                         <polyline points="12,6 12,12 16,14"></polyline>
                       </svg>
                     </div>
                     <div className="stat-content-inline">
                       <div className="stat-value-inline">{stats.late}</div>
                       <div className="stat-label-inline">지각</div>
                     </div>
                   </div>

                   <div className="stat-card-inline early">
                     <div className="stat-icon-inline">
                       <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                         <path d="M9 18l6-6-6-6"></path>
                       </svg>
                     </div>
                     <div className="stat-content-inline">
                       <div className="stat-value-inline">{stats.early}</div>
                       <div className="stat-label-inline">조퇴</div>
                     </div>
                   </div>
                 </>
               ) : (
                 // 전체현황: 결석, 지각, 조퇴만 전체 합계로 표시
                 <>
                   <div className="stat-card-inline absent">
                     <div className="stat-icon-inline">
                       <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                         <circle cx="12" cy="12" r="10"></circle>
                         <line x1="15" y1="9" x2="9" y2="15"></line>
                         <line x1="9" y1="9" x2="15" y2="15"></line>
                       </svg>
                     </div>
                     <div className="stat-content-inline">
                       <div className="stat-value-inline">{summaryStats.totalAbsent}</div>
                       <div className="stat-label-inline">결석</div>
                     </div>
                   </div>

                   <div className="stat-card-inline late">
                     <div className="stat-icon-inline">
                       <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                         <circle cx="12" cy="12" r="10"></circle>
                         <polyline points="12,6 12,12 16,14"></polyline>
                       </svg>
                     </div>
                     <div className="stat-content-inline">
                       <div className="stat-value-inline">{summaryStats.totalLate}</div>
                       <div className="stat-label-inline">지각</div>
                     </div>
                   </div>

                   <div className="stat-card-inline early">
                     <div className="stat-icon-inline">
                       <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                         <path d="M9 18l6-6-6-6"></path>
                       </svg>
                     </div>
                     <div className="stat-content-inline">
                       <div className="stat-value-inline">{summaryStats.totalEarly}</div>
                       <div className="stat-label-inline">조퇴</div>
                     </div>
                   </div>
                 </>
               )}
             </div>
           </div>

           <div className="control-right">
             <div className="search-section">
               <label className="search-label">학생이름:</label>
               <div className="search-input-container">
                 <input
                   type="text"
                   placeholder="학생명 검색..."
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                   className="search-input-field"
                 />
                 {searchTerm && (
                   <button 
                     className="search-clear-btn"
                     onClick={() => setSearchTerm('')}
                   >
                     <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                       <line x1="18" y1="6" x2="6" y2="18"></line>
                       <line x1="6" y1="6" x2="18" y2="18"></line>
                     </svg>
                   </button>
                 )}
               </div>
             </div>
           </div>
         </div>

         <div className={`date-controls ${viewMode === 'overall' ? 'disabled' : ''}`}>
           <button 
             className="date-button prev"
             onClick={() => changeDate(-1)}
             disabled={viewMode === 'overall'}
           >
             <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
               <polyline points="15,18 9,12 15,6"></polyline>
             </svg>
           </button>
           <input
             type="date"
             value={formatDate(selectedDate)}
             onChange={(e) => setSelectedDate(new Date(e.target.value))}
             className="date-input"
             disabled={viewMode === 'overall'}
           />
           <button 
             className="date-button next"
             onClick={() => changeDate(1)}
             disabled={viewMode === 'overall'}
           >
             <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
               <polyline points="9,18 15,12 9,6"></polyline>
             </svg>
           </button>
         </div>

        {showFilters && (
          <div className="filters-panel">
            <div className="filter-group">
              <label className="filter-label">검색</label>
              <div className="search-input-wrapper">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="M21 21l-4.35-4.35"></path>
                </svg>
                <input
                  type="text"
                  placeholder="학생명으로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>
            </div>

            <div className="filter-group">
              <label className="filter-label">반</label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="filter-select"
              >
                <option value="all">전체</option>
                {Array.from(new Set(students.map(s => s.class_id))).map(classId => (
                  <option key={classId} value={classId}>{classId}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label className="filter-label">출결상태</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="filter-select"
              >
                <option value="all">전체</option>
                <option value="출석">출석</option>
                <option value="결석">결석</option>
                <option value="지각">지각</option>
                <option value="조퇴">조퇴</option>
              </select>
            </div>

            <div className="filter-actions">
              <button 
                className="filter-clear"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedClass('all');
                  setSelectedStatus('all');
                }}
              >
                초기화
              </button>
            </div>
          </div>
        )}
      </section>


       {/* Attendance Table Section */}
       <section className="table-section">
         <div className={`table-container ${viewMode === 'overall' ? 'summary-container' : ''}`}>
          {viewMode === 'daily' ? (
            // 일별현황 테이블
            <table className="attendance-table">
              <thead>
                <tr>
                  <th className="col-number">번호</th>
                  <th className="col-name">학생명</th>
                  <th className="col-status">출결상태</th>
                  <th className="col-reason">사유</th>
                </tr>
              </thead>
              <tbody>
              {filteredStudents.map((student, index) => {
                const dateKey = formatDate(selectedDate);
                const attendance = attendanceData[`${student.id}_${dateKey}`];
                const pending = pendingChanges[`${student.id}_${dateKey}`];
                const isEditing = editingStudents[`${student.id}_${dateKey}`];
                const currentStatus = attendance?.status || pending?.status || '출석체크하기';
                const currentReason = attendance?.reason || pending?.reason || '';
                const isPending = !!pending && !attendance;
                const isSaved = !!attendance && !isPending;
                
                return (
                  <tr key={student.id} className="table-row">
                    <td className="col-number">{index + 1}</td>
                    <td className="col-name">
                      <div className="student-info">
                        <div className="student-avatar">
                          {student.student_name.charAt(0)}
                        </div>
                        <div className="student-details">
                          <span className="student-name">{student.student_name}</span>
                        </div>
                      </div>
                    </td>
                    <td className="col-status">
                      <select
                        value={currentStatus}
                        onChange={(e) => handleStatusSelect(student.id, e.target.value)}
                        className={`status-select status-${currentStatus === '출석체크하기' ? 'unchecked' : currentStatus.toLowerCase()}`}
                      >
                        <option value="출석체크하기">출석체크하기</option>
                        <option value="출석">출석</option>
                        <option value="결석">결석</option>
                        <option value="지각">지각</option>
                        <option value="조퇴">조퇴</option>
                      </select>
                    </td>
                    <td className="col-reason">
                      {(currentStatus === '지각' || currentStatus === '결석' || currentStatus === '조퇴') && (
                        <div className="reason-container">
                          {isSaved && !isEditing ? (
                            // 저장된 상태: 사유 표시 + 수정 버튼
                            <div className="reason-display">
                              <span className="reason-text">{currentReason}</span>
                              <button 
                                className="edit-reason-btn"
                                onClick={() => toggleEditMode(student.id)}
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                </svg>
                                수정
                              </button>
                            </div>
                          ) : (
                            // 편집 모드 또는 새로 입력: 입력박스 + 저장 버튼
                            <>
                              <input
                                type="text"
                                placeholder="사유 입력"
                                value={currentReason}
                                onChange={(e) => handleReasonChange(student.id, e.target.value)}
                                className="reason-input"
                              />
                              <button 
                                className={`save-reason-btn ${isPending ? 'pending' : 'saved'}`}
                                onClick={() => {
                                  if (isPending || isEditing) {
                                    handleSaveAttendance(student.id, currentStatus, currentReason);
                                  }
                                }}
                                disabled={!isPending && !isEditing}
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <polyline points="20,6 9,17 4,12"></polyline>
                                </svg>
                                {isPending ? '저장' : isEditing ? '저장' : '저장됨'}
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          ) : (
            // 전체현황 테이블
            <table className="attendance-table summary-table">
              <thead>
                  <tr>
                    <th className="col-number">번호</th>
                    <th className="col-name">학생명</th>
                    <th className="col-absent">
                      <div className="sort-header">
                        <span>결석</span>
                        <button 
                          className={`sort-btn ${sortBy === 'absent' ? 'active' : ''}`}
                          onClick={() => setSortBy(sortBy === 'absent' ? 'name' : 'absent')}
                        >
                          ▼
                        </button>
                      </div>
                    </th>
                    <th className="col-late">
                      <div className="sort-header">
                        <span>지각</span>
                        <button 
                          className={`sort-btn ${sortBy === 'late' ? 'active' : ''}`}
                          onClick={() => setSortBy(sortBy === 'late' ? 'name' : 'late')}
                        >
                          ▼
                        </button>
                      </div>
                    </th>
                    <th className="col-early">
                      <div className="sort-header">
                        <span>조퇴</span>
                        <button 
                          className={`sort-btn ${sortBy === 'early' ? 'active' : ''}`}
                          onClick={() => setSortBy(sortBy === 'early' ? 'name' : 'early')}
                        >
                          ▼
                        </button>
                      </div>
                    </th>
                    <th className="col-empty"></th>
                    <th className="col-empty"></th>
                    <th className="col-empty"></th>
                    <th className="col-empty"></th>
                    <th className="col-empty"></th>
                    <th className="col-empty"></th>
                    <th className="col-empty"></th>
                  </tr>
              </thead>
              <tbody>
                {filteredStatsStudents.map((stat, index) => (
                  <tr key={stat.student_id} className="table-row">
                    <td className="col-number">{index + 1}</td>
                    <td className="col-name">
                      <div className="student-info">
                        <div className="student-avatar">
                          {stat.student_name.charAt(0)}
                        </div>
                        <div className="student-details">
                          <span className="student-name">{stat.student_name}</span>
                        </div>
                      </div>
                    </td>
                    <td className="col-absent">
                      <span className={`count-badge ${stat.absent_count > 0 ? 'absent' : 'zero'}`}>
                        {stat.absent_count}
                      </span>
                    </td>
                    <td className="col-late">
                      <span className={`count-badge ${stat.late_count > 0 ? 'late' : 'zero'}`}>
                        {stat.late_count}
                      </span>
                    </td>
                    <td className="col-early">
                      <span className={`count-badge ${stat.early_count > 0 ? 'early' : 'zero'}`}>
                        {stat.early_count}
                      </span>
                    </td>
                    <td className="col-empty"></td>
                    <td className="col-empty"></td>
                    <td className="col-empty"></td>
                    <td className="col-empty"></td>
                    <td className="col-empty"></td>
                    <td className="col-empty"></td>
                    <td className="col-empty"></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

    </div>
  );
};

export default AttendancePage;
