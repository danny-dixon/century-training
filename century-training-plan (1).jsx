import React, { useState, useEffect } from 'react';
import { Check, TrendingUp, TrendingDown, X } from 'lucide-react';

const TrainingPlan = () => {
  const [completedRides, setCompletedRides] = useState(() => {
    const saved = localStorage.getItem('completedRides');
    return saved ? JSON.parse(saved) : {};
  });
  
  const [skippedRides, setSkippedRides] = useState(() => {
    const saved = localStorage.getItem('skippedRides');
    return saved ? JSON.parse(saved) : {};
  });
  
  const [actualMileage, setActualMileage] = useState(() => {
    const saved = localStorage.getItem('actualMileage');
    return saved ? JSON.parse(saved) : {};
  });
  
  const [editingMileage, setEditingMileage] = useState(null);
  
  const [celebratedMilestones, setCelebratedMilestones] = useState(() => {
    const saved = localStorage.getItem('celebratedMilestones');
    return saved ? JSON.parse(saved) : {};
  });
  
  const [showCelebration, setShowCelebration] = useState(null);
  
  const [isScrolled, setIsScrolled] = useState(false);
  
  const [startDate, setStartDate] = useState(() => {
    localStorage.removeItem('startDate');
    const correctStartDate = new Date(2026, 0, 19);
    localStorage.setItem('startDate', correctStartDate.toISOString());
    return correctStartDate;
  });
  
  const [isEditingDate, setIsEditingDate] = useState(false);
  
  useEffect(() => {
    let lastScrollY = window.scrollY;
    
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollingDown = currentScrollY > lastScrollY;
      
      if (scrollingDown && currentScrollY > 250) {
        setIsScrolled(true);
      } else if (!scrollingDown && currentScrollY < 150) {
        setIsScrolled(false);
      }
      
      lastScrollY = currentScrollY;
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const startLongRide = 30;
  const weeklyIncrease = 5;
  const numWeeks = 13;
  
  const getDateForDay = (weekNum, dayIndex) => {
    const date = new Date(startDate);
    date.setDate(date.getDate() + ((weekNum - 1) * 7) + dayIndex);
    return date;
  };
  
  const formatDate = (date) => {
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };
  
  const formatWeekDates = (weekNum) => {
    const startDay = new Date(startDate);
    startDay.setDate(startDay.getDate() + ((weekNum - 1) * 7));
    const endDay = new Date(startDay);
    endDay.setDate(endDay.getDate() + 6);
    
    return `${(startDay.getMonth() + 1)}/${startDay.getDate()} - ${(endDay.getMonth() + 1)}/${endDay.getDate()}`;
  };
  
  const isPastDate = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);
    return compareDate < today;
  };
  
  const getCurrentWeek = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const diffTime = today - start;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const weekNum = Math.floor(diffDays / 7) + 1;
    return weekNum >= 1 && weekNum <= numWeeks ? weekNum : null;
  };
  
  const handleDateChange = (e) => {
    const newDate = new Date(e.target.value);
    setStartDate(newDate);
    localStorage.setItem('startDate', newDate.toISOString());
    setIsEditingDate(false);
  };
  
  const generatePlan = () => {
    const weeks = [];
    
    for (let week = 0; week < numWeeks; week++) {
      const longRideDistance = week === 12 ? 100 : startLongRide + (week * weeklyIncrease);
      const mediumRideDistance = Math.min(12 + (week * 2), 20);
      
      const weekPlan = [
        { day: 'Mon', distance: 12, type: 'easy' },
        { day: 'Tue', distance: mediumRideDistance, type: 'medium' },
        { day: 'Wed', distance: 12, type: 'easy' },
        { day: 'Thu', distance: mediumRideDistance, type: 'medium' },
        { day: 'Fri', distance: 12, type: 'easy' },
        { day: 'Sat', distance: longRideDistance, type: 'long' },
        { day: 'Sun', distance: 0, type: 'rest' }
      ];
      
      weeks.push({
        weekNum: week + 1,
        days: weekPlan,
        totalMiles: weekPlan.reduce((sum, day) => sum + day.distance, 0)
      });
    }
    
    return weeks;
  };
  
  const plan = generatePlan();
  const currentWeek = getCurrentWeek();
  
  const getExpectedMilesUpToDate = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let expectedMiles = 0;
    
    plan.forEach(week => {
      week.days.forEach((day, idx) => {
        if (day.type === 'rest') return;
        const dayDate = getDateForDay(week.weekNum, idx);
        dayDate.setHours(0, 0, 0, 0);
        if (dayDate <= today) {
          expectedMiles += day.distance;
        }
      });
    });
    
    return expectedMiles;
  };
  
  const expectedMiles = getExpectedMilesUpToDate();
  
  const getCompletedMiles = (week) => {
    return week.days.reduce((sum, day, idx) => {
      const key = `${week.weekNum}-${idx}`;
      const isCompleted = completedRides[key];
      const actualMiles = actualMileage[key];
      return sum + (isCompleted ? (actualMiles || day.distance) : 0);
    }, 0);
  };
  
  const getTotalProgress = () => {
    let totalGoal = 0;
    let totalCompleted = 0;
    let totalRides = 0;
    let completedRidesCount = 0;
    
    plan.forEach(week => {
      week.days.forEach((day, idx) => {
        if (day.type !== 'rest') {
          totalGoal += day.distance;
          totalRides++;
          const key = `${week.weekNum}-${idx}`;
          if (completedRides[key]) {
            const actualMiles = actualMileage[key];
            totalCompleted += (actualMiles || day.distance);
            completedRidesCount++;
          }
        }
      });
    });
    
    return { totalGoal, totalCompleted, totalRides, completedRides: completedRidesCount };
  };
  
  const progress = getTotalProgress();
  const milesVariance = progress.totalCompleted - expectedMiles;
  
  const getWeekProgressPercent = (week) => {
    const totalDays = week.days.filter(d => d.type !== 'rest').length;
    const completedDays = week.days.filter((d, idx) => 
      d.type !== 'rest' && completedRides[`${week.weekNum}-${idx}`]
    ).length;
    return (completedDays / totalDays) * 100;
  };
  
  const getWeekMilesVariance = (week) => {
    const goalMiles = week.totalMiles;
    const completedMiles = getCompletedMiles(week);
    return completedMiles - goalMiles;
  };
  
  const getWeekExpectedMiles = (week) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let expectedMilesForWeek = 0;
    
    week.days.forEach((day, idx) => {
      if (day.type === 'rest') return;
      const dayDate = getDateForDay(week.weekNum, idx);
      dayDate.setHours(0, 0, 0, 0);
      if (dayDate <= today) {
        expectedMilesForWeek += day.distance;
      }
    });
    
    return expectedMilesForWeek;
  };
  
  const isWeekInPast = (week) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastDayOfWeek = getDateForDay(week.weekNum, 6);
    lastDayOfWeek.setHours(0, 0, 0, 0);
    return lastDayOfWeek < today;
  };
  
  const getWeekCompletionStats = (week) => {
    const totalRides = week.days.filter(d => d.type !== 'rest').length;
    const completedCount = week.days.filter((d, idx) => 
      d.type !== 'rest' && completedRides[`${week.weekNum}-${idx}`]
    ).length;
    return { completed: completedCount, total: totalRides };
  };
  
  const markComplete = (weekNum, dayIndex) => {
    const key = `${weekNum}-${dayIndex}`;
    
    // Remove from skipped if it was skipped
    const newSkippedRides = { ...skippedRides };
    delete newSkippedRides[key];
    setSkippedRides(newSkippedRides);
    localStorage.setItem('skippedRides', JSON.stringify(newSkippedRides));
    
    // Mark as completed
    const newCompletedRides = { ...completedRides, [key]: true };
    setCompletedRides(newCompletedRides);
    localStorage.setItem('completedRides', JSON.stringify(newCompletedRides));
    
    // Check for milestone celebration
    const day = plan.find(w => w.weekNum === weekNum)?.days[dayIndex];
    if (day && day.type === 'long') {
      const actualMiles = actualMileage[key] || day.distance;
      const milestones = [30, 40, 50, 60, 70, 80];
      const milestone = milestones.find(m => actualMiles >= m && !celebratedMilestones[m]);
      
      if (milestone) {
        const newCelebrated = { ...celebratedMilestones, [milestone]: true };
        setCelebratedMilestones(newCelebrated);
        localStorage.setItem('celebratedMilestones', JSON.stringify(newCelebrated));
        setShowCelebration(milestone);
        setTimeout(() => setShowCelebration(null), 4000);
      }
    }
  };
  
  const markSkipped = (weekNum, dayIndex) => {
    const key = `${weekNum}-${dayIndex}`;
    
    // Remove from completed if it was completed
    const newCompletedRides = { ...completedRides };
    delete newCompletedRides[key];
    setCompletedRides(newCompletedRides);
    localStorage.setItem('completedRides', JSON.stringify(newCompletedRides));
    
    // Mark as skipped
    const newSkippedRides = { ...skippedRides, [key]: true };
    setSkippedRides(newSkippedRides);
    localStorage.setItem('skippedRides', JSON.stringify(newSkippedRides));
  };
  
  const clearStatus = (weekNum, dayIndex) => {
    const key = `${weekNum}-${dayIndex}`;
    
    // Remove from both completed and skipped
    const newCompletedRides = { ...completedRides };
    delete newCompletedRides[key];
    setCompletedRides(newCompletedRides);
    localStorage.setItem('completedRides', JSON.stringify(newCompletedRides));
    
    const newSkippedRides = { ...skippedRides };
    delete newSkippedRides[key];
    setSkippedRides(newSkippedRides);
    localStorage.setItem('skippedRides', JSON.stringify(newSkippedRides));
  };
  
  const updateMileage = (weekNum, dayIndex, miles) => {
    const key = `${weekNum}-${dayIndex}`;
    const newMileage = {
      ...actualMileage,
      [key]: parseFloat(miles)
    };
    setActualMileage(newMileage);
    localStorage.setItem('actualMileage', JSON.stringify(newMileage));
    setEditingMileage(null);
  };
  
  const getTypeColor = (type, date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);
    const isFuture = compareDate > today;
    
    if (type === 'long') {
      return isFuture ? 'bg-gray-100 border-yellow-500' : 'bg-white border-yellow-500';
    }
    
    if (type === 'rest') {
      return 'bg-purple-50 border-purple-200';
    }
    
    if (isFuture) {
      return 'bg-gray-100 border-gray-200';
    }
    
    return 'bg-white border-gray-200';
  };
  
  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto pb-20">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Century Training Plan</h1>
        <p className="text-sm sm:text-base text-gray-600">13-week progression to 100 miles • Long ride starts at 30mi, increases by 5mi weekly</p>
        <div className="flex items-center gap-4 mt-2">
          <div className="text-sm text-gray-500">
            Start date: 
            {isEditingDate ? (
              <input
                type="date"
                defaultValue={startDate.toISOString().split('T')[0]}
                onChange={handleDateChange}
                onBlur={() => setIsEditingDate(false)}
                autoFocus
                className="ml-2 border rounded px-2 py-1"
              />
            ) : (
              <span 
                onClick={() => setIsEditingDate(true)}
                className="ml-2 cursor-pointer hover:underline"
              >
                {startDate.toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className={`sticky top-0 z-10 bg-white transition-all duration-500 ease-in-out ${isScrolled ? 'pb-2' : 'pb-4'} mb-6`}>
        {!isScrolled ? (
          <div className={`rounded-xl p-6 border-2 ${milesVariance >= 0 ? 'bg-gradient-to-r from-green-50 to-green-100 border-green-300' : 'bg-gradient-to-r from-orange-50 to-red-100 border-orange-300'}`}>
            <div className="flex items-center justify-center gap-3 mb-4">
              {milesVariance >= 0 ? (
                <TrendingUp className="w-10 h-10 text-green-600" />
              ) : (
                <TrendingDown className="w-10 h-10 text-orange-600" />
              )}
              <div className={`text-3xl font-bold ${milesVariance >= 0 ? 'text-green-600' : 'text-orange-600'}`}>
                {milesVariance > 0 ? '+' : ''}{milesVariance} miles {milesVariance >= 0 ? 'ahead of plan' : 'behind plan'}
              </div>
            </div>
            
            <div className="flex items-center justify-center gap-6 text-gray-700 mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xl font-semibold">Week {currentWeek || '—'}</span>
                <span className="text-gray-400">of 13</span>
              </div>
              <span className="text-gray-400">•</span>
              <div className="flex items-center gap-2">
                <span className="text-xl font-semibold">{Math.round((progress.totalCompleted / progress.totalGoal) * 100)}%</span>
                <span className="text-gray-400">complete</span>
              </div>
            </div>
            
            <div className="flex items-center justify-center gap-6 text-gray-700">
              <div className="flex items-center gap-2">
                <span className="text-xl font-semibold">{progress.totalCompleted.toLocaleString()}</span>
                <span className="text-gray-400">of {progress.totalGoal.toLocaleString()} miles</span>
              </div>
              <span className="text-gray-400">•</span>
              <div className="flex items-center gap-2">
                <span className="text-xl font-semibold">{progress.completedRides}</span>
                <span className="text-gray-400">of {progress.totalRides} rides</span>
              </div>
            </div>
            
            <div className="mt-3 bg-white/50 rounded-full h-2 relative">
              <div 
                className={`h-2 rounded-full transition-all ${milesVariance >= 0 ? 'bg-green-500' : 'bg-orange-500'}`}
                style={{ width: `${Math.round((progress.totalCompleted / progress.totalGoal) * 100)}%` }}
              />
              
              {[100, 250, 500, 1000, 1500].map(milestone => {
                const milestonePercent = (milestone / progress.totalGoal) * 100;
                const isPassed = progress.totalCompleted >= milestone;
                return (
                  <div
                    key={milestone}
                    className="absolute top-1/2 -translate-y-1/2 flex flex-col items-center"
                    style={{ left: `${milestonePercent}%` }}
                  >
                    <div 
                      className={`w-1 h-4 ${isPassed ? 'bg-green-600' : 'bg-gray-400'} rounded-full`}
                      title={`${milestone} miles`}
                    />
                    <div className="text-[10px] text-gray-500 mt-1 whitespace-nowrap">
                      {milestone}
                    </div>
                  </div>
                );
              })}
              
              <div 
                className="absolute top-1/2 -translate-y-1/2 transition-all duration-500 text-xl"
                style={{ 
                  left: `calc(${Math.round((progress.totalCompleted / progress.totalGoal) * 100)}% - 12px)`,
                  transform: 'translateY(-50%) scaleX(-1)'
                }}
              >
                🚴
              </div>
            </div>
          </div>
        ) : (
          <div className="border border-gray-300 rounded-lg px-4 py-2 bg-white shadow-md flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="font-semibold">Week {currentWeek || '—'}/13</span>
              <span className="text-gray-400">•</span>
              <span className={`font-bold ${milesVariance >= 0 ? 'text-green-600' : 'text-orange-600'}`}>
                {milesVariance > 0 ? '+' : ''}{milesVariance} miles {milesVariance >= 0 ? 'ahead' : 'behind'}
              </span>
            </div>
            <div className="text-sm text-gray-600">
              {progress.totalCompleted.toLocaleString()}/{progress.totalGoal.toLocaleString()} mi
            </div>
          </div>
        )}
      </div>
      
      {showCelebration && (
        <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50 animate-bounce">
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full shadow-2xl text-lg sm:text-xl font-bold">
            🎉 {showCelebration} Mile Ride Complete! 🚴
          </div>
        </div>
      )}
      
      <div className="space-y-6">
        {plan.map((week) => {
          const isCurrentWeek = week.weekNum === currentWeek;
          const completedMiles = getCompletedMiles(week);
          const weekProgress = getWeekProgressPercent(week);
          const weekStats = getWeekCompletionStats(week);
          const weekVariance = getWeekMilesVariance(week);
          const weekInPast = isWeekInPast(week);
          const expectedMilesForWeek = getWeekExpectedMiles(week);
          const onPaceVariance = completedMiles - expectedMilesForWeek;
          
          return (
            <div 
              key={week.weekNum} 
              className={`border rounded-lg p-4 shadow-sm transition-all ${
                isCurrentWeek ? 'bg-blue-50 border-blue-400 border-2' : 'bg-white'
              }`}
            >
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg font-semibold">Week {week.weekNum}</h2>
                  <span className="text-sm text-gray-500">
                    ({formatWeekDates(week.weekNum)})
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">Goal: {week.totalMiles} mi</div>
                  <div className="text-sm font-semibold text-green-600">
                    Completed: {completedMiles} mi
                    {weekInPast && weekVariance !== 0 && (
                      <span className={`ml-1 ${weekVariance > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ({weekVariance > 0 ? '+' : ''}{weekVariance})
                      </span>
                    )}
                    {isCurrentWeek && expectedMilesForWeek > 0 && onPaceVariance !== 0 && (
                      <span className={`ml-1 text-xs ${onPaceVariance >= 0 ? 'text-green-600' : 'text-orange-600'}`}>
                        ({onPaceVariance > 0 ? '+' : ''}{onPaceVariance} vs expected)
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="mb-4 relative h-8 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="absolute h-full bg-gradient-to-r from-blue-400 to-blue-500 transition-all duration-500 rounded-full"
                  style={{ width: `${weekProgress}%` }}
                />
                <div 
                  className="absolute top-1/2 -translate-y-1/2 transition-all duration-500 text-2xl"
                  style={{ left: `calc(${weekProgress}% - 16px)`, transform: 'translateY(-50%) scaleX(-1)' }}
                >
                  🚴
                </div>
              </div>
            
              <div className="grid grid-cols-7 gap-3">
                {week.days.map((day, idx) => {
                  const date = getDateForDay(week.weekNum, idx);
                  const isPast = isPastDate(date);
                  const key = `${week.weekNum}-${idx}`;
                  const isCompleted = completedRides[key];
                  const isSkipped = skippedRides[key];
                  const isMissed = isPast && !isCompleted && !isSkipped && day.type !== 'rest';
                  const actualMiles = actualMileage[key];
                  const displayMiles = actualMiles || day.distance;
                  const isEditing = editingMileage === key;
                  
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  const compareDate = new Date(date);
                  compareDate.setHours(0, 0, 0, 0);
                  const isToday = today.getTime() === compareDate.getTime();
                  
                  return (
                    <div
                      key={idx}
                      className={`group rounded p-4 min-h-[120px] transition-all relative ${getTypeColor(day.type, date)} ${
                        day.type === 'long' ? 'border-[3px]' : 'border-2'
                      } ${
                        isCompleted ? 'ring-2 ring-green-500' : ''
                      } ${isSkipped ? 'ring-2 ring-orange-500 opacity-60' : ''} ${isMissed ? 'ring-2 ring-red-500' : ''}`}
                      style={isToday && !isCompleted ? { 
                        boxShadow: '0 0 16px rgba(59, 130, 246, 0.5)', 
                        borderWidth: '3px', 
                        borderColor: day.type === 'long' ? 'rgb(234, 179, 8)' : 'rgb(96, 165, 250)'
                      } : isToday && isCompleted ? {
                        boxShadow: '0 0 16px rgba(34, 197, 94, 0.5)',
                        borderWidth: '3px',
                        borderColor: day.type === 'long' ? 'rgb(234, 179, 8)' : 'rgb(34, 197, 94)'
                      } : day.type === 'long' ? {
                        borderWidth: '3px',
                        borderColor: 'rgb(234, 179, 8)'
                      } : {}}
                    >
                      {/* Hover Action Buttons - only show for non-rest days when not editing */}
                      {day.type !== 'rest' && !isEditing && (
                        <div className="absolute bottom-2 left-2 right-2 flex justify-between opacity-0 group-hover:opacity-100 transition-opacity z-10">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (isCompleted || (!isCompleted && !isSkipped)) {
                                markSkipped(week.weekNum, idx);
                              } else if (isSkipped) {
                                clearStatus(week.weekNum, idx);
                              }
                            }}
                            className={`p-1.5 rounded-full shadow-lg transition-all ${
                              isSkipped 
                                ? 'bg-orange-500 hover:bg-gray-300' 
                                : 'bg-white hover:bg-orange-500 border border-gray-300'
                            }`}
                            title={isSkipped ? "Clear status" : "Mark skipped"}
                          >
                            <X className={`w-4 h-4 ${isSkipped ? 'text-white' : 'text-orange-600'}`} />
                          </button>
                          
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (isSkipped || (!isCompleted && !isSkipped)) {
                                markComplete(week.weekNum, idx);
                              } else if (isCompleted) {
                                clearStatus(week.weekNum, idx);
                              }
                            }}
                            className={`p-1.5 rounded-full shadow-lg transition-all ${
                              isCompleted 
                                ? 'bg-green-500 hover:bg-gray-300' 
                                : 'bg-white hover:bg-green-500 border border-gray-300'
                            }`}
                            title={isCompleted ? "Clear status" : "Mark complete"}
                          >
                            <Check className={`w-4 h-4 ${isCompleted ? 'text-white' : 'text-green-600'}`} />
                          </button>
                        </div>
                      )}
                      
                      {isMissed && (
                        <div className="absolute top-1 right-1 text-sm" title="Missed ride">⚠️</div>
                      )}
                      
                      <div className={`text-xs mb-2 text-center ${isToday && !isCompleted ? 'font-bold text-blue-600' : isToday && isCompleted ? 'font-bold text-green-600' : 'font-semibold text-gray-600'}`}>
                        <span>{day.day} ({formatDate(date)})</span>
                      </div>
                      
                      {isEditing ? (
                        <input
                          type="number"
                          defaultValue={displayMiles}
                          onBlur={(e) => updateMileage(week.weekNum, idx, e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              updateMileage(week.weekNum, idx, e.target.value);
                            }
                            if (e.key === 'Escape') {
                              setEditingMileage(null);
                            }
                          }}
                          onClick={(e) => e.stopPropagation()}
                          autoFocus
                          className="w-full text-3xl font-bold mb-2 border-2 border-blue-500 rounded px-1"
                        />
                      ) : (
                        <div 
                          className="text-3xl font-bold mb-2 px-1 py-1 rounded hover:bg-white/50 text-center cursor-pointer"
                          onClick={(e) => {
                            if (day.type !== 'rest') {
                              e.stopPropagation();
                              setEditingMileage(key);
                            }
                          }}
                        >
                          {isSkipped ? '—' : day.type === 'rest' ? '☺️' : displayMiles}
                        </div>
                      )}
                      
                      <div className="text-xs text-gray-500 mb-2 text-center">
                        {isSkipped ? 'skipped' : day.distance > 0 ? 'miles' : 'rest'}
                      </div>
                      
                      {isCompleted && (
                        <div className="flex justify-center">
                          <Check className="w-6 h-6 text-green-600" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TrainingPlan;
