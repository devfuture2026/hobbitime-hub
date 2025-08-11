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
  onTaskDrop: (taskId: string, newTime: Date) => void;
  currentTime?: Date;
}

export const CalendarGrid: React.FC<CalendarGridProps> = ({
  selectedDate,
  tasks,
  onTimeSlotClick,
  onTaskDrop,
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

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
  };

  const handleDrop = (e: React.DragEvent, dropTime: Date) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId) {
      onTaskDrop(taskId, dropTime);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div className="flex-1 bg-gradient-card rounded-lg shadow-medium overflow-hidden">
      {/* Header with days */}
      <div className="grid grid-cols-8 border-b border-border bg-card sticky top-0 z-10">
        <div className="p-3 border-r border-border bg-muted/50 min-w-[80px]">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Time</span>
        </div>
        {weekDays.map(day => {
          const isToday = day.toDateString() === new Date().toDateString();
          return (
            <div key={day.toISOString()} className="p-3 border-r border-border last:border-r-0 text-center bg-muted/20 min-w-[120px]">
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
          <div key={hour} className="grid grid-cols-8 relative" style={{ minHeight: '60px' }}>
            {/* Time label - Google Calendar style */}
            <div className="relative border-r border-border min-w-[80px]">
              <div className="absolute -top-2 left-2 bg-card px-1 text-xs text-muted-foreground font-medium z-10">
                {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
              </div>
              <div className="absolute top-0 right-0 w-4 h-px bg-border z-5" />
            </div>

            {/* Day slots */}
            {weekDays.map(day => {
              const slotTasks = getTasksForTimeSlot(day, hour);
              const isCurrentSlot = isCurrentTimeSlot(day, hour);
              const slotTime = addHours(new Date(day.getFullYear(), day.getMonth(), day.getDate()), hour);

              return (
                <div
                  key={`${day.toISOString()}-${hour}`}
                  className={cn(
                    "relative border-r border-border last:border-r-0 border-b border-border/30 cursor-pointer transition-all duration-150 min-h-[60px]",
                    "hover:bg-timeSlot-hover",
                    isCurrentSlot && "bg-timeSlot-selected"
                  )}
                  onClick={() => onTimeSlotClick(slotTime)}
                  onDrop={(e) => handleDrop(e, slotTime)}
                  onDragOver={handleDragOver}
                >
                  {/* Current time indicator line */}
                  {isCurrentSlot && (
                    <div className="absolute left-0 right-0 top-1/2 transform -translate-y-1/2 z-20">
                      <div className="h-0.5 bg-timeSlot-current relative">
                        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-timeSlot-current rounded-full -ml-1" />
                      </div>
                    </div>
                  )}
                  
                  {/* Tasks */}
                  <div className="p-1 space-y-1">
                    {slotTasks.map((task, index) => (
                      <div
                        key={task.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, task.id)}
                        className="p-2 rounded-md text-xs font-medium text-white shadow-sm cursor-move hover:shadow-md transition-all group"
                        style={{ 
                          backgroundColor: task.color,
                          borderLeft: `3px solid ${task.color}`,
                          filter: 'brightness(0.95)'
                        }}
                        title={`${task.title} - ${format(task.startTime, 'HH:mm')} (${task.duration}h)`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="truncate font-medium">{task.title}</div>
                        </div>
                        <div className="flex items-center justify-between text-xs opacity-90">
                          <span>{format(task.startTime, 'HH:mm')}</span>
                          {task.duration > 1 && <span>{task.duration}h</span>}
                        </div>
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