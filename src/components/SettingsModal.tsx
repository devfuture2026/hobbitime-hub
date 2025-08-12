import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings, Moon, Sun, Globe } from 'lucide-react';

interface SettingsModalProps {
  darkMode: boolean;
  onDarkModeToggle: () => void;
  timezone: string;
  onTimezoneChange: (timezone: string) => void;
}

const timezones = [
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'Europe/London', label: 'Greenwich Mean Time (GMT)' },
  { value: 'Europe/Paris', label: 'Central European Time (CET)' },
  { value: 'Asia/Tokyo', label: 'Japan Standard Time (JST)' },
  { value: 'Asia/Shanghai', label: 'China Standard Time (CST)' },
  { value: 'Australia/Sydney', label: 'Australian Eastern Time (AET)' },
];

export const SettingsModal: React.FC<SettingsModalProps> = ({
  darkMode,
  onDarkModeToggle,
  timezone,
  onTimezoneChange
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="border-primary/20">
          <Settings className="w-4 h-4 mr-2" />
          Settings
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Settings</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Theme Settings */}
          <div className="space-y-3">
            <Label className="text-base font-medium text-foreground">Appearance</Label>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {darkMode ? (
                  <Moon className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <Sun className="w-4 h-4 text-muted-foreground" />
                )}
                <span className="text-sm text-foreground">
                  {darkMode ? 'Dark mode' : 'Light mode'}
                </span>
              </div>
              <Switch
                checked={darkMode}
                onCheckedChange={onDarkModeToggle}
              />
            </div>
          </div>

          {/* Timezone Settings */}
          <div className="space-y-3">
            <Label className="text-base font-medium text-foreground">Time Zone</Label>
            <div className="flex items-center space-x-2">
              <Globe className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <Select value={timezone} onValueChange={onTimezoneChange}>
                <SelectTrigger className="flex-1 border-primary/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {timezones.map(tz => (
                    <SelectItem key={tz.value} value={tz.value}>
                      {tz.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Additional Settings Section */}
          <div className="space-y-3">
            <Label className="text-base font-medium text-foreground">Preferences</Label>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>• 24-hour time format</p>
              <p>• Weekend highlighting</p>
              <p>• Notification sounds</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            className="border-primary/20"
          >
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};