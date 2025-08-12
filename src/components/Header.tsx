import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Bell, Search, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { SettingsModal } from './SettingsModal';
import { format, addMonths, subMonths } from 'date-fns';

type ViewMode = 'day' | 'week' | 'month';

interface HeaderProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  showAlarms: boolean;
  onToggleAlarms: () => void;
  onGoToToday: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onNavigatePrevious: () => void;
  onNavigateNext: () => void;
  darkMode: boolean;
  onDarkModeToggle: () => void;
  timezone: string;
  onTimezoneChange: (timezone: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  selectedDate,
  onDateChange,
  showAlarms,
  onToggleAlarms,
  onGoToToday,
  searchQuery,
  onSearchChange,
  viewMode,
  onViewModeChange,
  onNavigatePrevious,
  onNavigateNext,
  darkMode,
  onDarkModeToggle,
  timezone,
  onTimezoneChange
}) => {
  const getDisplayText = () => {
    switch (viewMode) {
      case 'day':
        return format(selectedDate, 'EEEE, MMMM d, yyyy');
      case 'week':
        return format(selectedDate, 'MMMM yyyy');
      case 'month':
        return format(selectedDate, 'MMMM yyyy');
      default:
        return format(selectedDate, 'MMMM yyyy');
    }
  };

  const getViewModeLabel = (mode: ViewMode) => {
    switch (mode) {
      case 'day': return 'Day';
      case 'week': return 'Week';
      case 'month': return 'Month';
      default: return 'Week';
    }
  };

  return (
    <header className="bg-card border-b border-border shadow-soft sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left side - Logo and Navigation */}
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-primary rounded-lg">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-foreground">Productive Calendar</h1>
                <p className="text-sm text-muted-foreground">Track your hobbies and projects</p>
              </div>
            </div>
            
            {/* Navigation and View Controls */}
            <div className="flex items-center space-x-3">
              {/* Navigation Arrows */}
              <div className="flex items-center border border-border rounded-lg">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onNavigatePrevious}
                  className="h-8 w-8 p-0 hover:bg-muted"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <div className="px-3 py-1 text-sm font-medium text-foreground min-w-[120px] text-center">
                  {getDisplayText()}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onNavigateNext}
                  className="h-8 w-8 p-0 hover:bg-muted"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={onGoToToday}
                className="border-primary/20 hover:bg-primary/10"
              >
                <Clock className="w-4 h-4 mr-2" />
                Today
              </Button>

              {/* View Mode Selector */}
              <Select value={viewMode} onValueChange={(value) => onViewModeChange(value as ViewMode)}>
                <SelectTrigger className="w-24 border-primary/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="day">Day</SelectItem>
                  <SelectItem value="week">Week</SelectItem>
                  <SelectItem value="month">Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Right side - Search and Controls */}
          <div className="flex items-center space-x-3">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search projects, tasks, events..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10 w-64 border-primary/20 focus:ring-primary"
              />
            </div>
            
            {/* Control Buttons */}
            <Button
              variant={showAlarms ? "default" : "outline"}
              size="sm"
              onClick={onToggleAlarms}
              className={showAlarms ? "bg-primary" : "border-primary/20"}
            >
              <Bell className="w-4 h-4 mr-2" />
              Alarms
            </Button>
            
            <SettingsModal
              darkMode={darkMode}
              onDarkModeToggle={onDarkModeToggle}
              timezone={timezone}
              onTimezoneChange={onTimezoneChange}
            />
          </div>
        </div>
      </div>
    </header>
  );
};