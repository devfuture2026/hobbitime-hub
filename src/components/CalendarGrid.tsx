import React, { useState } from 'react';
import { format, startOfWeek, addDays, addHours, isSameHour } from 'date-fns';
import { cn } from '@/lib/utils';

interface Task {
  id: string;
  title: string;
  projectId: string;
  startTime: Date;
  duration: number; // in hours
  color: string;
}

interface CalendarGridProps {
  selectedDate: Date;
  tasks: Task[];
  onTimeSlotClick: (time: Date) => void;
  currentTime?: Date;
}

export const CalendarGrid: React.FC<CalendarGridProps> = ({
  selectedDate,
  tasks,
  onTimeSlotClick,
  currentTime = new Date()
}) => {
  const startWeek = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(startWeek, i));
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const getTasksForTimeSlot = (day: Date, hour: number) => {
    const slotTime = addHours(new Date(day.getFullYear(), day.getMonth(), day.getDate()), hour);
    return tasks.filter(task => 
      isSameHour(task.startTime, slotTime)
    );
  };

  const isCurrentTimeSlot = (day: Date, hour: number) => {
    const slotTime = addHours(new Date(day.getFullYear(), day.getMonth(), day.getDate()), hour);
    return isSameHour(slotTime, currentTime) && 
           day.toDateString() === currentTime.toDateString();
  };

  return (
    <div className="flex-1 bg-gradient-card rounded-lg shadow-medium overflow-hidden">
      {/* Header with days */}
      <div className="grid grid-cols-8 border-b border-border bg-card">
        <div className="p-4 border-r border-border">
          <span className="text-sm font-medium text-muted-foreground">Time</span>
        </div>
        {weekDays.map(day => (
          <div key={day.toISOString()} className="p-4 border-r border-border last:border-r-0 text-center">
            <div className="text-sm font-medium text-foreground">
              {format(day, 'EEE')}
            </div>
            <div className="text-lg font-semibold text-primary mt-1">
              {format(day, 'd')}
            </div>
          </div>
        ))}
      </div>

      {/* Time grid */}
      <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
        {hours.map(hour => (
          <div key={hour} className="grid grid-cols-8 border-b border-border last:border-b-0">
            {/* Time label */}
            <div className="p-3 border-r border-border bg-muted/30 flex items-center justify-center">
              <span className="text-sm font-medium text-muted-foreground">
                {format(new Date().setHours(hour, 0, 0, 0), 'HH:mm')}
              </span>
            </div>

            {/* Day slots */}
            {weekDays.map(day => {
              const slotTasks = getTasksForTimeSlot(day, hour);
              const isCurrentSlot = isCurrentTimeSlot(day, hour);

              return (
                <div
                  key={`${day.toISOString()}-${hour}`}
                  className={cn(
                    "min-h-[60px] p-2 border-r border-border last:border-r-0 cursor-pointer transition-all duration-200",
                    "hover:bg-timeSlot-hover",
                    isCurrentSlot && "bg-timeSlot-current/10 border-l-4 border-l-timeSlot-current"
                  )}
                  onClick={() => onTimeSlotClick(addHours(new Date(day.getFullYear(), day.getMonth(), day.getDate()), hour))}
                >
                  {slotTasks.map(task => (
                    <div
                      key={task.id}
                      className="mb-1 p-2 rounded-md text-xs font-medium truncate shadow-soft"
                      style={{ backgroundColor: task.color }}
                    >
                      {task.title}
                    </div>
                  ))}
                  {isCurrentSlot && (
                    <div className="absolute right-2 top-2 w-2 h-2 bg-timeSlot-current rounded-full animate-pulse" />
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};