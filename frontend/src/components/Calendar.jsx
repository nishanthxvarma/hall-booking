import { useState } from 'react';

const Calendar = ({ onDateSelect, selectedDate }) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const getDaysInMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    };

    const formatDate = (year, month, day) => {
        return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    };

    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);

    const prevMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
    };

    const nextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
    };

    const handleDateClick = (day) => {
        const dateStr = formatDate(currentMonth.getFullYear(), currentMonth.getMonth(), day);
        const clickedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
        if (clickedDate >= today) {
            onDateSelect(dateStr);
        }
    };

    const isToday = (day) => {
        return (
            day === today.getDate() &&
            currentMonth.getMonth() === today.getMonth() &&
            currentMonth.getFullYear() === today.getFullYear()
        );
    };

    const isSelected = (day) => {
        const dateStr = formatDate(currentMonth.getFullYear(), currentMonth.getMonth(), day);
        return dateStr === selectedDate;
    };

    const isPast = (day) => {
        const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
        return date < today;
    };

    return (
        <div className="glass-card rounded-2xl p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <button
                    onClick={prevMonth}
                    className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-600 hover:text-gray-900"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <h3 className="text-lg font-bold text-gray-800">
                    {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                </h3>
                <button
                    onClick={nextMonth}
                    className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-600 hover:text-gray-900"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            </div>

            {/* Day Names */}
            <div className="grid grid-cols-7 gap-1 mb-2">
                {dayNames.map((day) => (
                    <div key={day} className="text-center text-xs font-semibold text-gray-500 py-2">
                        {day}
                    </div>
                ))}
            </div>

            {/* Days */}
            <div className="grid grid-cols-7 gap-1">
                {Array(firstDay).fill(null).map((_, i) => (
                    <div key={`empty-${i}`} className="h-10" />
                ))}
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => (
                    <button
                        key={day}
                        onClick={() => handleDateClick(day)}
                        disabled={isPast(day)}
                        className={`h-10 w-full rounded-xl text-sm font-medium transition-all duration-200 ${isSelected(day)
                                ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30 scale-105'
                                : isToday(day)
                                    ? 'bg-primary-100 text-primary-700 font-bold ring-2 ring-primary-300'
                                    : isPast(day)
                                        ? 'text-gray-300 cursor-not-allowed'
                                        : 'text-gray-700 hover:bg-primary-50 hover:text-primary-600'
                            }`}
                    >
                        {day}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default Calendar;
