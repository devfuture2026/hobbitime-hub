import React, { useState } from 'react';
import { format, startOfWeek, addDays, addHours, isSameHour, addWeeks, subWeeks } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

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
  onDateChange: (date: Date) => void;
  currentTime?: Date;
  viewMode: 'day' | 'week' | 'month';
}

export const CalendarGrid: React.FC<CalendarGridProps> = ({
  selectedDate,
  tasks,
  onTimeSlotClick,
  onTaskDrop,
  onDateChange,
  currentTime = new Date(),
  viewMode
}) => {
  const startWeek = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(startWeek, i));
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const handlePreviousWeek = () => {
    onDateChange(subWeeks(selectedDate, 1));
  };

  const handleNextWeek = () => {
    onDateChange(addWeeks(selectedDate, 1));
  };

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
    <div className="flex-1 bg-gradient-card rounded-lg shadow-medium overflow-hidden flex flex-col">
      {/* Week Navigation Header */}
      <div className="flex items-center justify-between p-3 border-b border-border bg-card">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handlePreviousWeek}
          className="h-8 w-8 p-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="text-sm font-medium text-foreground">
          {format(startWeek, 'MMM d')} - {format(addDays(startWeek, 6), 'MMM d, yyyy')}
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleNextWeek}
          className="h-8 w-8 p-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Header with days - Fixed grid alignment */}
      <div className="grid grid-cols-[80px_repeat(7,1fr)] border-b border-border bg-card sticky top-0 z-10">
        <div className="p-3 border-r border-border bg-muted/50 flex items-center justify-center">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Time</span>
        </div>
        {weekDays.map((day, index) => {
          const isToday = day.toDateString() === new Date().toDateString();
          return (
            <div key={day.toISOString()} className={cn(
              "p-3 text-center bg-muted/20 flex flex-col items-center justify-center",
              index < 6 ? "border-r border-border" : ""
            )}>
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {format(day, 'EEE')}
              </div>
              <div className={cn(
                "text-xl font-semibold mt-1",
                isToday ? "text-primary bg-primary/10 w-8 h-8 rounded-full flex items-center justify-center" : "text-foreground"
              )}>
                {format(day, 'd')}
              </div>
            </div>
          );
        })}
      </div>

      {/* Calendar Grid - Fixed scrollbar and alignment */}
      <div className="flex-1 relative" style={{ scrollbarGutter: 'stable both-edges' }}>
        <div className="h-full overflow-y-auto pr-2">
          {hours.map(hour => (
            <div key={hour} className="grid grid-cols-[80px_repeat(7,1fr)] relative border-b border-border/30 last:border-b-0" style={{ minHeight: '60px' }}>
              {/* Time label - Aligned with grid */}
              <div className="relative border-r border-border flex items-start justify-end pr-2 pt-1">
                {hour > 0 && (
                  <div className="text-xs text-muted-foreground font-medium leading-none">
                    {hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
                  </div>
                )}
                <div className="absolute top-0 right-0 w-2 h-px bg-border" />
              </div>

              {/* Day slots - Fixed alignment and spacing */}
              {weekDays.map((day, dayIndex) => {
                const slotTasks = getTasksForTimeSlot(day, hour);
                const isCurrentSlot = isCurrentTimeSlot(day, hour);
                const slotTime = addHours(new Date(day.getFullYear(), day.getMonth(), day.getDate()), hour);

                return (
                  <div
                    key={`${day.toISOString()}-${hour}`}
                    className={cn(
                      "relative cursor-pointer transition-all duration-150 min-h-[60px] flex-1",
                      dayIndex < 6 ? "border-r border-border" : "",
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
                    
                    {/* Tasks with proper spacing */}
                    <div className="p-1 mx-1 space-y-1">
                      {slotTasks.map((task) => (
                        <div
                          key={task.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, task.id)}
                          className="px-2 py-1 rounded text-xs font-medium text-white shadow-sm cursor-move hover:shadow-md transition-all group mx-0.5"
                          style={{ 
                            backgroundColor: task.color,
                            borderLeft: `3px solid ${task.color}`,
                            filter: 'brightness(0.95)'
                          }}
                          title={`${task.title} - ${format(task.startTime, 'HH:mm')} (${task.duration}h)`}
                        >
                          <div className="truncate font-medium text-xs">{task.title}</div>
                          <div className="flex items-center justify-between text-xs opacity-90 mt-0.5">
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
    </div>
  );
};