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
      <div className="grid grid-cols-8 border-b border-border bg-card sticky top-0 z-10">
        <div className="p-3 border-r border-border bg-muted/50">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Time</span>
        </div>
        {weekDays.map(day => {
          const isToday = day.toDateString() === new Date().toDateString();
          return (
            <div key={day.toISOString()} className="p-3 border-r border-border last:border-r-0 text-center bg-muted/20">
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {format(day, 'EEE')}
              </div>
              <div className={cn(
                "text-xl font-semibold mt-1",
                isToday ? "text-primary bg-primary/10 w-8 h-8 rounded-full flex items-center justify-center mx-auto" : "text-foreground"
              )}>
                {format(day, 'd')}
              </div>
            </div>
          );
        })}
      </div>

      {/* Time grid - Google Calendar style */}
      <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
        {hours.map(hour => (
          <div key={hour} className="grid grid-cols-8 relative" style={{ minHeight: '80px' }}>
            {/* Time label - positioned absolutely like Google Calendar */}
            <div className="relative border-r border-border">
              <div className="absolute -top-2 left-2 bg-card px-2 text-xs text-muted-foreground font-medium">
                {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
              </div>
            </div>

            {/* Day slots */}
            {weekDays.map(day => {
              const slotTasks = getTasksForTimeSlot(day, hour);
              const isCurrentSlot = isCurrentTimeSlot(day, hour);

              return (
                <div
                  key={`${day.toISOString()}-${hour}`}
                  className={cn(
                    "relative border-r border-border last:border-r-0 border-b border-border/30 cursor-pointer transition-all duration-150",
                    "hover:bg-primary/5",
                    isCurrentSlot && "bg-primary/10"
                  )}
                  onClick={() => onTimeSlotClick(addHours(new Date(day.getFullYear(), day.getMonth(), day.getDate()), hour))}
                >
                  {/* Current time indicator line */}
                  {isCurrentSlot && (
                    <div className="absolute left-0 right-0 top-1/2 transform -translate-y-1/2 z-20">
                      <div className="h-0.5 bg-primary relative">
                        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-primary rounded-full -ml-1" />
                      </div>
                    </div>
                  )}
                  
                  {/* Tasks */}
                  <div className="p-1 space-y-1">
                    {slotTasks.map((task, index) => (
                      <div
                        key={task.id}
                        className="p-2 rounded text-xs font-medium text-white shadow-sm border-l-4 cursor-pointer hover:shadow-md transition-shadow"
                        style={{ 
                          backgroundColor: task.color,
                          borderLeftColor: task.color,
                          filter: 'brightness(0.9)'
                        }}
                        title={`${task.title} - ${task.duration}h`}
                      >
                        <div className="truncate font-medium">{task.title}</div>
                        {task.duration > 1 && (
                          <div className="text-xs opacity-90">{task.duration}h</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};