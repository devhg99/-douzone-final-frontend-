import React, { useState, useRef, useEffect } from 'react';
import './TimePicker.css';

const TimePicker = ({ 
  value, 
  onChange, 
  placeholder = "시간을 선택하세요",
  className = "",
  disabled = false 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [time, setTime] = useState(() => {
    if (value) {
      const [hours, minutes] = value.split(':');
      const hour = parseInt(hours);
      return {
        period: hour >= 12 ? 'PM' : 'AM',
        hour: hour === 0 ? 12 : hour > 12 ? hour - 12 : hour,
        minute: parseInt(minutes)
      };
    }
    return { period: 'AM', hour: null, minute: null };
  });

  const dropdownRef = useRef(null);
  const isInternalUpdate = useRef(false);

  // value prop이 변경될 때 내부 상태 업데이트 (무한 루프 방지)
  useEffect(() => {
    if (isInternalUpdate.current) {
      isInternalUpdate.current = false;
      return;
    }

    if (value) {
      const [hours, minutes] = value.split(':');
      const hour = parseInt(hours);
      const newTime = {
        period: hour >= 12 ? 'PM' : 'AM',
        hour: hour === 0 ? 12 : hour > 12 ? hour - 12 : hour,
        minute: parseInt(minutes)
      };
      
      // 현재 상태와 다를 때만 업데이트
      if (time.hour !== newTime.hour || time.minute !== newTime.minute || time.period !== newTime.period) {
        setTime(newTime);
      }
    } else if (time.hour !== null || time.minute !== null) {
      setTime({ period: 'AM', hour: null, minute: null });
    }
  }, [value]);

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 시간 변경 시 부모 컴포넌트에 전달
  useEffect(() => {
    // 시간이나 분이 null이면 빈 문자열 전달
    if (time.hour === null || time.minute === null) {
      if (value !== '') {
        isInternalUpdate.current = true;
        onChange('');
      }
      return;
    }
    
    const hour24 = time.period === 'AM' 
      ? (time.hour === 12 ? 0 : time.hour)
      : (time.hour === 12 ? 12 : time.hour + 12);
    
    const timeString = `${hour24.toString().padStart(2, '0')}:${time.minute.toString().padStart(2, '0')}`;
    
    // 현재 value와 다를 때만 onChange 호출
    if (value !== timeString) {
      isInternalUpdate.current = true;
      onChange(timeString);
    }
  }, [time, onChange, value]);

  const handlePeriodToggle = () => {
    setTime(prev => ({
      ...prev,
      period: prev.period === 'AM' ? 'PM' : 'AM'
    }));
  };

  const handleHourChange = (hour) => {
    setTime(prev => ({ 
      ...prev, 
      hour,
      minute: prev.minute === null ? 0 : prev.minute  // 시간 선택 시 분이 null이면 0으로 설정
    }));
  };

  const handleMinuteChange = (minute) => {
    setTime(prev => ({ ...prev, minute }));
  };

  const formatDisplayTime = () => {
    if (!value) return placeholder;
    const [hours, minutes] = value.split(':');
    const hour = parseInt(hours);
    const period = hour >= 12 ? '오후' : '오전';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${period} ${displayHour}시 ${minutes}분`;
  };

  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes = [0, 15, 30, 45];

  return (
    <div className={`time-picker ${className}`} ref={dropdownRef}>
      <div 
        className={`time-picker-input ${isOpen ? 'open' : ''} ${disabled ? 'disabled' : ''}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <span className="time-display">{formatDisplayTime()}</span>
        <svg 
          className={`time-picker-arrow ${isOpen ? 'rotated' : ''}`} 
          width="12" 
          height="8" 
          viewBox="0 0 12 8"
        >
          <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="2" fill="none"/>
        </svg>
      </div>

      {isOpen && (
        <div className="time-picker-dropdown">
          {/* 오전/오후 토글 */}
          <div className="period-toggle">
            <button
              className={`period-btn ${time.period === 'AM' ? 'active' : ''}`}
              onClick={handlePeriodToggle}
            >
              오전
            </button>
            <button
              className={`period-btn ${time.period === 'PM' ? 'active' : ''}`}
              onClick={handlePeriodToggle}
            >
              오후
            </button>
          </div>

          {/* 시간/분 선택 */}
          <div className="time-selectors">
            <div className="selector-group">
              <label>시간</label>
              <select 
                value={time.hour || ''} 
                onChange={(e) => handleHourChange(parseInt(e.target.value))}
                className="time-select"
              >
                <option value="">시</option>
                {hours.map(hour => (
                  <option key={hour} value={hour}>{hour}시</option>
                ))}
              </select>
            </div>

            <div className="selector-group">
              <label>분</label>
              <select 
                value={time.minute || ''} 
                onChange={(e) => handleMinuteChange(parseInt(e.target.value))}
                className="time-select"
              >
                <option value="">분</option>
                {minutes.map(minute => (
                  <option key={minute} value={minute}>{minute.toString().padStart(2, '0')}분</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimePicker;
