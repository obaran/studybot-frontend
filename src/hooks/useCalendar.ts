import { useState, useCallback, useMemo } from 'react';

interface CalendarDate {
  day: number;
  dateString: string;
  isCurrentMonth: boolean;
  isToday: boolean;
  hasConversations: boolean;
  isSelected: boolean;
  isInRange: boolean;
  isRangeStart: boolean;
  isRangeEnd: boolean;
}

interface DateRange {
  startDate: string | null;
  endDate: string | null;
}

export const useCalendar = (conversations: any[] = []) => {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [dateRange, setDateRange] = useState<DateRange>({ startDate: null, endDate: null });
  const [isSelectingRange, setIsSelectingRange] = useState(false);

  // Navigation entre mois
  const goToPreviousMonth = useCallback(() => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  }, [currentMonth]);

  const goToNextMonth = useCallback(() => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  }, [currentMonth]);

  const goToToday = useCallback(() => {
    const today = new Date();
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
  }, []);

  // Sélection de dates
  const selectDate = useCallback((dateString: string) => {
    if (!isSelectingRange) {
      // Mode sélection simple
      setDateRange({ startDate: dateString, endDate: dateString });
    } else {
      // Mode sélection de fourchette
      if (!dateRange.startDate) {
        setDateRange({ startDate: dateString, endDate: null });
      } else if (!dateRange.endDate) {
        const start = new Date(dateRange.startDate);
        const selected = new Date(dateString);
        
        if (selected >= start) {
          setDateRange(prev => ({ ...prev, endDate: dateString }));
        } else {
          setDateRange({ startDate: dateString, endDate: dateRange.startDate });
        }
      } else {
        // Nouvelle sélection
        setDateRange({ startDate: dateString, endDate: null });
      }
    }
  }, [dateRange, isSelectingRange]);

  const clearSelection = useCallback(() => {
    setDateRange({ startDate: null, endDate: null });
  }, []);

  const toggleRangeMode = useCallback(() => {
    setIsSelectingRange(prev => !prev);
    setDateRange({ startDate: null, endDate: null });
  }, []);

  // Génération du calendrier
  const calendarDates = useMemo(() => {
    const dates: CalendarDate[] = [];
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const firstDayWeekday = (firstDay.getDay() + 6) % 7; // Lundi = 0
    
    // Jours du mois précédent
    const prevMonth = new Date(currentYear, currentMonth - 1, 0);
    for (let i = firstDayWeekday - 1; i >= 0; i--) {
      const day = prevMonth.getDate() - i;
      const date = new Date(currentYear, currentMonth - 1, day);
      const dateString = date.toISOString().split('T')[0];
      
      dates.push({
        day,
        dateString,
        isCurrentMonth: false,
        isToday: false,
        hasConversations: conversations.some(conv => 
          new Date(conv.startTime).toISOString().split('T')[0] === dateString
        ),
        isSelected: dateString === dateRange.startDate || dateString === dateRange.endDate,
        isInRange: isDateInRange(dateString, dateRange),
        isRangeStart: dateString === dateRange.startDate,
        isRangeEnd: dateString === dateRange.endDate
      });
    }

    // Jours du mois actuel
    const today = new Date().toISOString().split('T')[0];
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(currentYear, currentMonth, day);
      const dateString = date.toISOString().split('T')[0];
      
      dates.push({
        day,
        dateString,
        isCurrentMonth: true,
        isToday: dateString === today,
        hasConversations: conversations.some(conv => 
          new Date(conv.startTime).toISOString().split('T')[0] === dateString
        ),
        isSelected: dateString === dateRange.startDate || dateString === dateRange.endDate,
        isInRange: isDateInRange(dateString, dateRange),
        isRangeStart: dateString === dateRange.startDate,
        isRangeEnd: dateString === dateRange.endDate
      });
    }

    // Jours du mois suivant pour compléter la grille
    const totalCells = 42; // 6 semaines × 7 jours
    const remainingCells = totalCells - dates.length;
    for (let day = 1; day <= remainingCells; day++) {
      const date = new Date(currentYear, currentMonth + 1, day);
      const dateString = date.toISOString().split('T')[0];
      
      dates.push({
        day,
        dateString,
        isCurrentMonth: false,
        isToday: false,
        hasConversations: conversations.some(conv => 
          new Date(conv.startTime).toISOString().split('T')[0] === dateString
        ),
        isSelected: dateString === dateRange.startDate || dateString === dateRange.endDate,
        isInRange: isDateInRange(dateString, dateRange),
        isRangeStart: dateString === dateRange.startDate,
        isRangeEnd: dateString === dateRange.endDate
      });
    }

    return dates;
  }, [currentMonth, currentYear, conversations, dateRange]);

  // Utilitaires
  const monthName = useMemo(() => {
    return new Date(currentYear, currentMonth).toLocaleDateString('fr-FR', { 
      month: 'long', 
      year: 'numeric' 
    });
  }, [currentMonth, currentYear]);

  const isDateInRange = useCallback((dateString: string, range: DateRange): boolean => {
    if (!range.startDate || !range.endDate) return false;
    const date = new Date(dateString);
    const start = new Date(range.startDate);
    const end = new Date(range.endDate);
    return date > start && date < end;
  }, []);

  // Formater la période sélectionnée
  const selectedPeriodText = useMemo(() => {
    if (!dateRange.startDate) return null;
    
    const startDate = new Date(dateRange.startDate);
    const endDate = dateRange.endDate ? new Date(dateRange.endDate) : null;
    
    if (!endDate || startDate.getTime() === endDate.getTime()) {
      return startDate.toLocaleDateString('fr-FR');
    }
    
    return `${startDate.toLocaleDateString('fr-FR')} - ${endDate.toLocaleDateString('fr-FR')}`;
  }, [dateRange]);

  return {
    // État
    currentMonth,
    currentYear,
    monthName,
    dateRange,
    isSelectingRange,
    calendarDates,
    selectedPeriodText,
    
    // Actions
    goToPreviousMonth,
    goToNextMonth,
    goToToday,
    selectDate,
    clearSelection,
    toggleRangeMode,
    
    // Utilitaires
    hasDateRange: dateRange.startDate !== null
  };
}; 