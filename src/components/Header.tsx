import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Bell, Settings, Search, Clock } from 'lucide-react';
import { format, addMonths, subMonths } from 'date-fns';

interface HeaderProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  showAlarms: boolean;
  onToggleAlarms: () => void;
  onGoToToday: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  selectedDate,
  onDateChange,
  showAlarms,
  onToggleAlarms,
  onGoToToday,
  searchQuery,
  onSearchChange
}) => {
  const currentMonth = format(selectedDate, 'MMMM yyyy');
  
  const generateMonthOptions = () => {
    const options = [];
    for (let i = -6; i <= 6; i++) {
      const monthDate = addMonths(new Date(), i);
      const value = format(monthDate, 'yyyy-MM');
      const label = format(monthDate, 'MMMM yyyy');
      options.push({ value, label });
    }
    return options;
  };

  const handleMonthChange = (value: string) => {
    const [year, month] = value.split('-');
    const newDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    onDateChange(newDate);
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
            
            {/* Month selector and Today button */}
            <div className="flex items-center space-x-3">
              <Select value={format(selectedDate, 'yyyy-MM')} onValueChange={handleMonthChange}>
                <SelectTrigger className="w-40 border-primary/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {generateMonthOptions().map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button
                variant="outline"
                size="sm"
                onClick={onGoToToday}
                className="border-primary/20 hover:bg-primary/10"
              >
                <Clock className="w-4 h-4 mr-2" />
                Today
              </Button>
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
            
            <Button variant="outline" size="sm" className="border-primary/20">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};