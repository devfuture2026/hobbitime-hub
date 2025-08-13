import React, { useState } from 'react';
import { format, startOfWeek, addDays, addHours, isSameHour, addWeeks, subWeeks, startOfDay, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';
import { ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface Task {
  id: string;
  title: string;
  projectId: string;
  startTime: Date;
  duration: number; // in hours
  color: string;
}

type CalendarView = 'daily' | 'weekly' | 'monthly';

interface CalendarGridProps {
  selectedDate: Date;
  tasks: Task[];
  onTimeSlotClick: (time: Date) => void;
  onTaskDrop: (taskId: string, newTime: Date) => void;
  onDateChange: (date: Date) => void;
  currentTime?: Date;
}

export const CalendarGrid: React.FC<CalendarGridProps> = ({
  selectedDate,
  tasks,
  onTimeSlotClick,
  onTaskDrop,
  onDateChange,
  currentTime = new Date()
}) => {
  const [view, setView] = useState<CalendarView>('weekly');
  
  const startWeek = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(startWeek, i));
  const hours = Array.from({ length: 24 }, (_, i) => i);

  // Get display days based on view
  const getDisplayDays = () => {
    switch (view) {
      case 'daily':
        return [selectedDate];
      case 'monthly':
        const monthStart = startOfMonth(selectedDate);
        const monthEnd = endOfMonth(selectedDate);
        const startWeekOfMonth = startOfWeek(monthStart, { weekStartsOn: 1 });
        const endWeekOfMonth = startOfWeek(monthEnd, { weekStartsOn: 1 });
        // Get all days from start of first week to end of last week
        return eachDayOfInterval({
          start: startWeekOfMonth,
          end: addDays(endWeekOfMonth, 6)
        });
      default:
        return weekDays;
    }
  };

  const displayDays = getDisplayDays();

  const handlePrevious = () => {
    switch (view) {
      case 'daily':
        onDateChange(addDays(selectedDate, -1));
        break;
      case 'monthly':
        onDateChange(subMonths(selectedDate, 1));
        break;
      default:
        onDateChange(subWeeks(selectedDate, 1));
    }
  };

  const handleNext = () => {
    switch (view) {
      case 'daily':
        onDateChange(addDays(selectedDate, 1));
        break;
      case 'monthly':
        onDateChange(addMonths(selectedDate, 1));
        break;
      default:
        onDateChange(addWeeks(selectedDate, 1));
    }
  };

  const getNavigationLabel = () => {
    switch (view) {
      case 'daily':
        return format(selectedDate, 'EEEE, MMM d, yyyy');
      case 'monthly':
        return format(selectedDate, 'MMMM yyyy');
      default:
        return `${format(startWeek, 'MMM d')} - ${format(addDays(startWeek, 6), 'MMM d, yyyy')}`;
    }
  };

  const getTasksForTimeSlot = (day: Date, hour?: number) => {
    if (view === 'monthly') {
      // For monthly view, get all tasks for the entire day
      return tasks.filter(task => 
        isSameDay(task.startTime, day)
      );
    }
    const slotTime = addHours(new Date(day.getFullYear(), day.getMonth(), day.getDate()), hour || 0);
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
      {/* Navigation Header */}
      <div className="flex items-center justify-between p-3 border-b border-border bg-card">
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handlePrevious}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-sm font-medium text-foreground">
            {getNavigationLabel()}
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleNext}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        
        {/* View Selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8">
              <Eye className="w-4 h-4 mr-1" />
              View
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setView('daily')}>
              Daily
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setView('weekly')}>
              Weekly
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setView('monthly')}>
              Monthly
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Header with days - Dynamic grid alignment */}
      {view === 'monthly' ? (
        // Monthly view header - 7 columns grid for days of week
        <div className="grid grid-cols-7 border-b border-border bg-card sticky top-0 z-10">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((dayName, index) => (
            <div key={dayName} className={cn(
              "p-3 text-center bg-muted/20 flex items-center justify-center border-r border-border last:border-r-0"
            )}>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {dayName}
              </span>
            </div>
          ))}
        </div>
      ) : (
        // Daily/Weekly view header with time column
        <div className={`grid border-b border-border bg-card sticky top-0 z-10 ${view === 'daily' ? 'grid-cols-[80px_1fr]' : 'grid-cols-[80px_repeat(7,1fr)]'}`}>
          <div className="p-3 border-r border-border bg-muted/50 flex items-center justify-center">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Time</span>
          </div>
          {displayDays.map((day, index) => {
            const isToday = day.toDateString() === new Date().toDateString();
            return (
              <div key={day.toISOString()} className={cn(
                "p-3 text-center bg-muted/20 flex flex-col items-center justify-center",
                (view !== 'daily' && index < displayDays.length - 1) ? "border-r border-border" : ""
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
      )}

      {/* Calendar Grid - Scrollable frame */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-scroll overflow-x-auto scroll-smooth" style={{ height: 'calc(100vh - 300px)' }}>
          {view === 'monthly' ? (
            // Monthly grid view
            <div className="grid grid-cols-7 auto-rows-fr min-h-full">
              {displayDays.map((day, dayIndex) => {
                const dayTasks = getTasksForTimeSlot(day);
                const isToday = day.toDateString() === new Date().toDateString();
                const isCurrentMonth = day.getMonth() === selectedDate.getMonth();
                
                return (
                  <div
                    key={day.toISOString()}
                    className={cn(
                      "relative border-r border-b border-border/30 last:border-r-0 min-h-[120px] p-2 cursor-pointer transition-all duration-150",
                      "hover:bg-timeSlot-hover",
                      !isCurrentMonth && "bg-muted/20 text-muted-foreground",
                      isToday && "bg-timeSlot-selected"
                    )}
                    onClick={() => onTimeSlotClick(startOfDay(day))}
                    onDrop={(e) => handleDrop(e, startOfDay(day))}
                    onDragOver={handleDragOver}
                  >
                    {/* Date number */}
                    <div className={cn(
                      "text-sm font-medium mb-2",
                      isToday ? "text-primary bg-primary/10 w-6 h-6 rounded-full flex items-center justify-center" : "text-foreground"
                    )}>
                      {format(day, 'd')}
                    </div>
                    
                    {/* Tasks */}
                    <div className="space-y-1">
                      {dayTasks.slice(0, 3).map((task) => (
                        <div
                          key={task.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, task.id)}
                          className="px-2 py-1 rounded text-xs font-medium text-white shadow-sm cursor-move hover:shadow-md transition-all truncate"
                          style={{ 
                            backgroundColor: task.color,
                            filter: 'brightness(0.95)'
                          }}
                          title={`${task.title} - ${format(task.startTime, 'HH:mm')} (${task.duration}h)`}
                        >
                          {task.title}
                        </div>
                      ))}
                      {dayTasks.length > 3 && (
                        <div className="text-xs text-muted-foreground px-2">
                          +{dayTasks.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            // Daily/Weekly time slot view
            <div className="min-w-full">
              {hours.map(hour => (
                <div key={hour} className={`grid relative border-b border-border/30 last:border-b-0 ${view === 'daily' ? 'grid-cols-[80px_1fr]' : 'grid-cols-[80px_repeat(7,1fr)]'}`} style={{ height: '60px' }}>
                  {/* Time label - Perfectly aligned */}
                  <div className="relative border-r border-border flex items-start justify-end pr-3 pt-1 bg-background">
                    <div className="text-xs text-muted-foreground font-medium leading-none">
                      {hour === 0 ? '12 AM' : hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
                    </div>
                    <div className="absolute top-0 right-0 w-3 h-px bg-border" />
                  </div>

                  {/* Day slots - Perfect alignment and spacing */}
                  {displayDays.map((day, dayIndex) => {
                    const slotTasks = getTasksForTimeSlot(day, hour);
                    const isCurrentSlot = isCurrentTimeSlot(day, hour);
                    const slotTime = addHours(new Date(day.getFullYear(), day.getMonth(), day.getDate()), hour);

                    return (
                      <div
                        key={`${day.toISOString()}-${hour}`}
                        className={cn(
                          "relative cursor-pointer transition-all duration-150 border-r border-border/30 last:border-r-0",
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
                        
                        {/* Tasks with proper spacing and fit */}
                        <div className="absolute inset-0 p-1">
                          <div className="h-full flex flex-col gap-0.5">
                            {slotTasks.map((task, index) => (
                              <div
                                key={task.id}
                                draggable
                                onDragStart={(e) => handleDragStart(e, task.id)}
                                className="px-2 py-1 rounded text-xs font-medium text-white shadow-sm cursor-move hover:shadow-md transition-all flex-shrink-0"
                                style={{ 
                                  backgroundColor: task.color,
                                  borderLeft: `3px solid ${task.color}`,
                                  filter: 'brightness(0.95)',
                                  maxHeight: `${(60 - 8) / slotTasks.length - 2}px`,
                                  minHeight: '20px'
                                }}
                                title={`${task.title} - ${format(task.startTime, 'HH:mm')} (${task.duration}h)`}
                              >
                                <div className="truncate font-medium leading-tight">{task.title}</div>
                                {slotTasks.length === 1 && (
                                  <div className="flex items-center justify-between text-xs opacity-90 leading-tight">
                                    <span>{format(task.startTime, 'HH:mm')}</span>
                                    {task.duration > 1 && <span>{task.duration}h</span>}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};