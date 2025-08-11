import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bell, Volume2, Clock, Plus, Trash2, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Alarm {
  id: string;
  time: string;
  enabled: boolean;
  sound: string;
  label: string;
  recurring: boolean;
}

interface AlarmPanelProps {
  alarms: Alarm[];
  onAlarmUpdate: (alarms: Alarm[]) => void;
}

export const AlarmPanel: React.FC<AlarmPanelProps> = ({
  alarms,
  onAlarmUpdate
}) => {
  const [isAddingAlarm, setIsAddingAlarm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newAlarm, setNewAlarm] = useState({
    time: '07:00',
    label: 'Morning Alarm',
    sound: 'bell',
    recurring: true
  });

  const alarmSounds = [
    { value: 'bell', label: 'Classic Bell' },
    { value: 'chime', label: 'Gentle Chime' },
    { value: 'birds', label: 'Bird Song' },
    { value: 'ocean', label: 'Ocean Waves' },
    { value: 'piano', label: 'Piano Melody' },
    { value: 'custom', label: 'Custom Sound' }
  ];

  const [customSoundFile, setCustomSoundFile] = useState<string>('');

  const addAlarm = () => {
    const alarm: Alarm = {
      id: Date.now().toString(),
      time: newAlarm.time,
      enabled: true,
      sound: newAlarm.sound,
      label: newAlarm.label,
      recurring: newAlarm.recurring
    };
    onAlarmUpdate([...alarms, alarm]);
    setIsAddingAlarm(false);
    setNewAlarm({
      time: '07:00',
      label: 'Morning Alarm',
      sound: 'bell',
      recurring: true
    });
  };

  const toggleAlarm = (id: string) => {
    const updated = alarms.map(alarm =>
      alarm.id === id ? { ...alarm, enabled: !alarm.enabled } : alarm
    );
    onAlarmUpdate(updated);
  };

  const deleteAlarm = (id: string) => {
    const updated = alarms.filter(alarm => alarm.id !== id);
    onAlarmUpdate(updated);
  };

  const checkAlarms = () => {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    alarms.forEach(alarm => {
      if (alarm.enabled && alarm.time === currentTime) {
        // Trigger alarm sound
        playAlarmSound(alarm.sound);
        showAlarmNotification(alarm.label);
      }
    });
  };

  const playAlarmSound = (sound: string) => {
    // This would play the actual alarm sound
    console.log(`Playing alarm sound: ${sound}`);
    // You could integrate with Web Audio API or audio files here
  };

  const showAlarmNotification = (label: string) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Alarm', {
        body: label,
        icon: '/favicon.ico'
      });
    }
  };

  useEffect(() => {
    const interval = setInterval(checkAlarms, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [alarms]);

  useEffect(() => {
    if ('Notification' in window) {
      Notification.requestPermission();
    }
  }, []);

  const filteredAlarms = alarms.filter(alarm =>
    alarm.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    alarm.time.includes(searchQuery)
  );

  return (
    <Card className="bg-gradient-card shadow-medium">
      <CardHeader>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Bell className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">Alarms ({alarms.length})</CardTitle>
          </div>
          <Button
            onClick={() => setIsAddingAlarm(true)}
            size="sm"
            variant="outline"
            className="border-primary/20 hover:bg-primary/5"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        
        {/* Search field */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search alarms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 text-sm border-primary/20"
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Existing Alarms */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {filteredAlarms.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">
                {searchQuery ? 'No alarms match your search' : 'No alarms set'}
              </p>
            </div>
          ) : (
            filteredAlarms.map(alarm => (
              <div
                key={alarm.id}
                className={cn(
                  "flex items-center justify-between p-3 rounded-lg border transition-all duration-200 hover:shadow-soft",
                  alarm.enabled 
                    ? "bg-primary/5 border-primary/20" 
                    : "bg-muted/30 border-border"
                )}
              >
                <div className="flex items-center space-x-3">
                  <Switch
                    checked={alarm.enabled}
                    onCheckedChange={() => toggleAlarm(alarm.id)}
                    className="data-[state=checked]:bg-primary"
                  />
                  <div>
                    <div className={cn(
                      "text-xl font-semibold font-mono",
                      alarm.enabled ? "text-foreground" : "text-muted-foreground"
                    )}>
                      {alarm.time}
                    </div>
                    <div className={cn(
                      "text-sm font-medium",
                      alarm.enabled ? "text-foreground" : "text-muted-foreground"
                    )}>
                      {alarm.label}
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center space-x-2">
                      <Volume2 className="w-3 h-3" />
                      <span>{alarmSounds.find(s => s.value === alarm.sound)?.label}</span>
                      {alarm.recurring && (
                        <>
                          <span>•</span>
                          <span className="text-accent font-medium">Daily</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <Button
                  onClick={() => deleteAlarm(alarm.id)}
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive-foreground hover:bg-destructive/10 h-8 w-8 p-0"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))
          )}
        </div>

        {/* Add New Alarm Form */}
        {isAddingAlarm && (
          <div className="space-y-4 p-4 border border-primary/20 rounded-lg bg-primary/5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="alarm-time" className="text-sm font-medium">Time</Label>
                <Input
                  id="alarm-time"
                  type="time"
                  value={newAlarm.time}
                  onChange={(e) => setNewAlarm({ ...newAlarm, time: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="alarm-sound" className="text-sm font-medium">Sound</Label>
                <Select
                  value={newAlarm.sound}
                  onValueChange={(value) => setNewAlarm({ ...newAlarm, sound: value })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {alarmSounds.map(sound => (
                      <SelectItem key={sound.value} value={sound.value}>
                        <div className="flex items-center space-x-2">
                          <Volume2 className="w-4 h-4" />
                          <span>{sound.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="alarm-label" className="text-sm font-medium">Label</Label>
              <Input
                id="alarm-label"
                value={newAlarm.label}
                onChange={(e) => setNewAlarm({ ...newAlarm, label: e.target.value })}
                placeholder="Morning Alarm"
                className="mt-1"
              />
            </div>
            
            {/* Custom Sound File Upload */}
            {newAlarm.sound === 'custom' && (
              <div>
                <Label htmlFor="custom-sound" className="text-sm font-medium">Custom Sound File</Label>
                <Input
                  id="custom-sound"
                  type="file"
                  accept="audio/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const url = URL.createObjectURL(file);
                      setCustomSoundFile(url);
                    }
                  }}
                  className="mt-1"
                />
                {customSoundFile && (
                  <div className="mt-2">
                    <audio controls className="w-full">
                      <source src={customSoundFile} />
                      Your browser does not support the audio element.
                    </audio>
                  </div>
                )}
              </div>
            )}
            
            <div className="flex items-center space-x-2">
              <Switch
                checked={newAlarm.recurring}
                onCheckedChange={(checked) => setNewAlarm({ ...newAlarm, recurring: checked })}
              />
              <Label className="text-sm">Recurring daily</Label>
            </div>
            <div className="flex space-x-2">
              <Button onClick={addAlarm} className="bg-gradient-primary text-white">
                <Clock className="w-4 h-4 mr-2" />
                Add Alarm
              </Button>
              <Button
                onClick={() => setIsAddingAlarm(false)}
                variant="outline"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

      </CardContent>
    </Card>
  );
};
