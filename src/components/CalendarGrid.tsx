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

interface Alarm {
  id: string;
  time: string;
  enabled: boolean;
  sound: string;
  label: string;
  recurring: boolean;
}

interface CalendarItem extends Task {
  isAlarm?: boolean;
  time?: string;
}

type CalendarView = 'daily' | 'weekly' | 'monthly';

interface CalendarGridProps {
  selectedDate: Date;
  tasks: Task[];
  onTimeSlotClick: (time: Date) => void;
  onTaskDrop: (taskId: string, newTime: Date) => void;
  onDateChange: (date: Date) => void;
  currentTime?: Date;
  alarms?: Alarm[];
  showAlarms?: boolean;
}

export const CalendarGrid: React.FC<CalendarGridProps> = ({
  selectedDate,
  tasks,
  onTimeSlotClick,
  onTaskDrop,
  onDateChange,
  currentTime = new Date(),
  alarms = [],
  showAlarms = false
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

  const getAlarmsForTimeSlot = (day: Date, hour: number) => {
    if (!showAlarms) return [];
    const hourString = hour.toString().padStart(2, '0') + ':00';
    return alarms.filter(alarm => 
      alarm.enabled && 
      alarm.time.startsWith(hourString.slice(0, 2)) &&
      (isSameDay(day, new Date()) || alarm.recurring)
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

      {/* Header with days - Perfectly aligned grid structure */}
      {view === 'monthly' ? (
        // Monthly view header - Exact 7 column grid alignment
        <div className="grid grid-cols-7 border-b bg-card sticky top-0 z-10" style={{ borderColor: 'hsl(var(--app-border))' }}>
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((dayName, index) => (
            <div key={dayName} className="p-3 text-center flex items-center justify-center" style={{ 
              backgroundColor: 'hsl(var(--app-chip-bg))',
              borderRight: index < 6 ? '1px solid hsl(var(--app-border))' : 'none'
            }}>
              <span className="text-xs font-medium uppercase tracking-wide" style={{ color: 'hsl(var(--app-text-muted))' }}>
                {dayName}
              </span>
            </div>
          ))}
        </div>
      ) : (
        // Daily/Weekly view header - Perfect time column alignment
        <div className={`grid border-b bg-card sticky top-0 z-10 ${view === 'daily' ? 'grid-cols-[80px_1fr]' : 'grid-cols-[80px_repeat(7,1fr)]'}`} style={{ borderColor: 'hsl(var(--app-border))' }}>
          <div className="p-3 flex items-center justify-center" style={{ 
            backgroundColor: 'hsl(var(--app-chip-bg))',
            borderRight: '1px solid hsl(var(--app-border))'
          }}>
            <span className="text-xs font-medium uppercase tracking-wide" style={{ color: 'hsl(var(--app-text-muted))' }}>Time</span>
          </div>
          {displayDays.map((day, index) => {
            const isToday = day.toDateString() === new Date().toDateString();
            return (
              <div key={day.toISOString()} className="p-3 text-center flex flex-col items-center justify-center" style={{ 
                backgroundColor: 'hsl(var(--app-chip-bg))',
                borderRight: (view !== 'daily' && index < displayDays.length - 1) ? '1px solid hsl(var(--app-border))' : 'none'
              }}>
                <div className="text-xs font-medium uppercase tracking-wide" style={{ color: 'hsl(var(--app-text-muted))' }}>
                  {format(day, 'EEE')}
                </div>
                <div className={cn(
                  "text-xl font-semibold mt-1",
                  isToday ? "w-8 h-8 rounded-full flex items-center justify-center" : ""
                )} style={{
                  color: isToday ? 'hsl(var(--app-primary))' : 'hsl(var(--app-text))',
                  backgroundColor: isToday ? 'hsl(var(--app-today-highlight))' : 'transparent'
                }}>
                  {format(day, 'd')}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Calendar Grid - Perfect alignment and scrolling */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto scroll-smooth" style={{ height: 'calc(100vh - 300px)' }}>
          {view === 'monthly' ? (
            // Monthly grid - Always 6 rows with perfect alignment
            <div className="grid grid-cols-7" style={{ gridTemplateRows: 'repeat(6, 120px)' }}>
              {/* Ensure we always show 42 days (6 weeks) */}
              {(() => {
                const monthStart = startOfMonth(selectedDate);
                const firstDisplayDay = startOfWeek(monthStart, { weekStartsOn: 1 });
                const allDays = Array.from({ length: 42 }, (_, i) => addDays(firstDisplayDay, i));
                
                return allDays.map((day, dayIndex) => {
                  const dayTasks = getTasksForTimeSlot(day);
                  const isToday = day.toDateString() === new Date().toDateString();
                  const isCurrentMonth = day.getMonth() === selectedDate.getMonth();
                  const rowIndex = Math.floor(dayIndex / 7);
                  const colIndex = dayIndex % 7;
                  
                  return (
                    <div
                      key={day.toISOString()}
                      className="relative p-2 cursor-pointer transition-all duration-150"
                      style={{
                        backgroundColor: isToday ? 'hsl(var(--app-today-highlight))' : 'hsl(var(--app-card))',
                        borderRight: colIndex < 6 ? '1px solid hsl(var(--app-border))' : 'none',
                        borderBottom: rowIndex < 5 ? '1px solid hsl(var(--app-border))' : 'none',
                        opacity: isCurrentMonth ? 1 : 0.5,
                        color: isCurrentMonth ? 'hsl(var(--app-text))' : 'hsl(var(--app-text-muted))'
                      }}
                      onClick={() => onTimeSlotClick(startOfDay(day))}
                      onDrop={(e) => handleDrop(e, startOfDay(day))}
                      onDragOver={handleDragOver}
                    >
                      {/* Date number */}
                      <div className="text-sm font-medium mb-2" style={{
                        color: isToday ? 'hsl(var(--app-primary))' : isCurrentMonth ? 'hsl(var(--app-text))' : 'hsl(var(--app-text-muted))',
                        backgroundColor: isToday ? 'hsl(var(--app-primary) / 0.1)' : 'transparent',
                        width: isToday ? '24px' : 'auto',
                        height: isToday ? '24px' : 'auto',
                        borderRadius: isToday ? '50%' : '0',
                        display: isToday ? 'flex' : 'block',
                        alignItems: isToday ? 'center' : 'normal',
                        justifyContent: isToday ? 'center' : 'normal'
                      }}>
                        {format(day, 'd')}
                      </div>
                      
                      {/* Tasks */}
                      <div className="space-y-1">
                        {dayTasks.slice(0, 3).map((task) => (
                          <div
                            key={task.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, task.id)}
                            className="px-2 py-1 rounded text-xs font-medium shadow-sm cursor-move hover:shadow-md transition-all truncate"
                            style={{ 
                              backgroundColor: 'hsl(var(--app-chip-bg))',
                              color: 'hsl(var(--app-chip-text))',
                              borderLeft: `3px solid ${task.color}`
                            }}
                            title={`${task.title} - ${format(task.startTime, 'HH:mm')} (${task.duration}h)`}
                          >
                            {task.title}
                          </div>
                        ))}
                        {dayTasks.length > 3 && (
                          <div className="text-xs px-2" style={{ color: 'hsl(var(--app-text-muted))' }}>
                            +{dayTasks.length - 3} more
                          </div>
                        )}
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          ) : (
            // Daily/Weekly time slot view - Perfect alignment
            <div className="min-w-full">
              {hours.map(hour => (
                <div key={hour} className={`grid relative last:border-b-0 ${view === 'daily' ? 'grid-cols-[80px_1fr]' : 'grid-cols-[80px_repeat(7,1fr)]'}`} style={{ 
                  height: '60px',
                  borderBottom: '1px solid hsl(var(--app-border))'
                }}>
                  {/* Time label - Perfect alignment with header */}
                  <div className="relative flex items-center justify-end pr-3" style={{ 
                    backgroundColor: 'hsl(var(--app-background))',
                    borderRight: '1px solid hsl(var(--app-border))'
                  }}>
                    <div className="text-xs font-medium leading-none" style={{ color: 'hsl(var(--app-text-muted))' }}>
                      {hour === 0 ? '12 AM' : hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
                    </div>
                    <div className="absolute top-0 right-0 w-3 h-px" style={{ backgroundColor: 'hsl(var(--app-border))' }} />
                  </div>

                  {/* Day slots - Perfect column alignment */}
                  {displayDays.map((day, dayIndex) => {
                    const slotTasks = getTasksForTimeSlot(day, hour);
                    const slotAlarms = getAlarmsForTimeSlot(day, hour);
                    const isCurrentSlot = isCurrentTimeSlot(day, hour);
                    const slotTime = addHours(new Date(day.getFullYear(), day.getMonth(), day.getDate()), hour);
                    const allItems: CalendarItem[] = [
                      ...slotTasks,
                      ...slotAlarms.map(alarm => ({
                        id: `alarm-${alarm.id}`,
                        title: `🔔 ${alarm.label}`,
                        projectId: '',
                        startTime: new Date(),
                        duration: 0,
                        color: '#8B5CF6',
                        time: alarm.time,
                        isAlarm: true
                      }))
                    ];

                    return (
                      <div
                        key={`${day.toISOString()}-${hour}`}
                        className="relative cursor-pointer transition-all duration-150"
                        style={{
                          backgroundColor: isCurrentSlot ? 'hsl(var(--app-today-highlight))' : 'hsl(var(--app-card))',
                          borderRight: (view !== 'daily' && dayIndex < displayDays.length - 1) ? '1px solid hsl(var(--app-border))' : 'none'
                        }}
                        onClick={() => onTimeSlotClick(slotTime)}
                        onDrop={(e) => handleDrop(e, slotTime)}
                        onDragOver={handleDragOver}
                      >
                        {/* Current time indicator line */}
                        {isCurrentSlot && (
                          <div className="absolute left-0 right-0 top-1/2 transform -translate-y-1/2 z-20">
                            <div className="h-0.5 relative" style={{ backgroundColor: 'hsl(var(--app-primary))' }}>
                              <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-2 h-2 rounded-full -ml-1" style={{ backgroundColor: 'hsl(var(--app-primary))' }} />
                            </div>
                          </div>
                        )}
                        
                        {/* Tasks and Alarms */}
                        <div className="absolute inset-0 p-1">
                          <div className="h-full flex flex-col gap-0.5">
                            {allItems.map((item, index) => (
                              <div
                                key={item.id}
                                draggable={!item.isAlarm}
                                onDragStart={(e) => !item.isAlarm && handleDragStart(e, item.id)}
                                className={cn(
                                  "px-2 py-1 rounded text-xs font-medium shadow-sm transition-all flex-shrink-0",
                                  item.isAlarm ? "cursor-default" : "cursor-move hover:shadow-md"
                                )}
                                style={{ 
                                  backgroundColor: item.isAlarm ? '#8B5CF6' : 'hsl(var(--app-chip-bg))',
                                  color: item.isAlarm ? 'white' : 'hsl(var(--app-chip-text))',
                                  borderLeft: `3px solid ${item.color}`,
                                  maxHeight: `${(60 - 8) / allItems.length - 2}px`,
                                  minHeight: '20px'
                                }}
                                title={item.isAlarm ? `Alarm: ${item.title} at ${item.time}` : `${item.title} - ${format(slotTime, 'HH:mm')}`}
                              >
                                <div className="truncate font-medium leading-tight">{item.title}</div>
                                {allItems.length === 1 && !item.isAlarm && item.duration > 0 && (
                                  <div className="flex items-center justify-between text-xs opacity-90 leading-tight">
                                    <span>{format(slotTime, 'HH:mm')}</span>
                                    {item.duration > 1 && <span>{item.duration}h</span>}
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