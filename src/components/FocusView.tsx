import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Target, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  Calendar,
  Bell,
  Sunrise,
  Sun,
  Moon,
  ChevronRight
} from 'lucide-react';
import { format, isToday, isBefore, isAfter, startOfDay, addDays } from 'date-fns';

interface Task {
  id: string;
  title: string;
  projectId: string;
  startTime: Date;
  duration: number;
  color: string;
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
  dueDate?: Date | null;
  area?: string;
}

interface Project {
  id: string;
  name: string;
  color: string;
  category: 'hobby' | 'work' | 'personal';
  dueDate?: Date | null;
  area: string;
}

interface Alarm {
  id: string;
  time: string;
  enabled: boolean;
  label: string;
}

interface FocusViewProps {
  tasks: Task[];
  projects: Project[];
  alarms: Alarm[];
  onTaskClick?: (taskId: string) => void;
  onProjectClick?: (projectId: string) => void;
}

export const FocusView: React.FC<FocusViewProps> = ({
  tasks,
  projects,
  alarms,
  onTaskClick,
  onProjectClick
}) => {
  const now = new Date();
  const today = startOfDay(now);
  const currentHour = now.getHours();

  // Tasks scheduled for today
  const todayTasks = useMemo(() => 
    tasks.filter(task => isToday(task.startTime) && !task.completed)
      .sort((a, b) => a.startTime.getTime() - b.startTime.getTime()),
    [tasks]
  );

  // Overdue tasks (due date passed and not completed)
  const overdueTasks = useMemo(() => 
    tasks.filter(task => 
      task.dueDate && 
      isBefore(new Date(task.dueDate), today) && 
      !task.completed
    ).sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime()),
    [tasks, today]
  );

  // Tasks due today
  const dueTodayTasks = useMemo(() => 
    tasks.filter(task => 
      task.dueDate && 
      isToday(new Date(task.dueDate)) && 
      !task.completed
    ),
    [tasks]
  );

  // Upcoming deadlines (next 7 days)
  const upcomingDeadlines = useMemo(() => {
    const weekFromNow = addDays(today, 7);
    return tasks.filter(task => 
      task.dueDate && 
      isAfter(new Date(task.dueDate), today) && 
      isBefore(new Date(task.dueDate), weekFromNow) &&
      !task.completed &&
      !isToday(new Date(task.dueDate))
    ).sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime());
  }, [tasks, today]);

  // Active alarms for today
  const activeAlarms = useMemo(() => 
    alarms.filter(alarm => alarm.enabled),
    [alarms]
  );

  // Group today's tasks by time of day
  const morningTasks = todayTasks.filter(t => {
    const hour = new Date(t.startTime).getHours();
    return hour >= 5 && hour < 12;
  });
  
  const afternoonTasks = todayTasks.filter(t => {
    const hour = new Date(t.startTime).getHours();
    return hour >= 12 && hour < 17;
  });
  
  const eveningTasks = todayTasks.filter(t => {
    const hour = new Date(t.startTime).getHours();
    return hour >= 17 || hour < 5;
  });

  // Completed tasks today
  const completedTodayCount = useMemo(() => 
    tasks.filter(task => isToday(task.startTime) && task.completed).length,
    [tasks]
  );

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
    }
  };

  const getProject = (projectId: string) => projects.find(p => p.id === projectId);

  const getCurrentTimeBlock = () => {
    if (currentHour >= 5 && currentHour < 12) return 'morning';
    if (currentHour >= 12 && currentHour < 17) return 'afternoon';
    return 'evening';
  };

  const renderTaskCard = (task: Task, showTime: boolean = true) => {
    const project = getProject(task.projectId);
    return (
      <div 
        key={task.id}
        className="p-3 bg-card border border-border rounded-lg hover:border-primary/30 transition-all cursor-pointer group"
        onClick={() => onTaskClick?.(task.id)}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div 
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: task.color }}
            />
            <span className="font-medium text-sm text-foreground truncate">{task.title}</span>
          </div>
          <Badge className={getPriorityColor(task.priority)}>
            {task.priority}
          </Badge>
        </div>
        <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
          {showTime && (
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{format(task.startTime, 'h:mm a')}</span>
              <span>({task.duration}h)</span>
            </div>
          )}
          {project && (
            <div className="flex items-center gap-1 truncate">
              <div 
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: project.color }}
              />
              <span className="truncate max-w-24">{project.name}</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderTimeBlock = (
    title: string, 
    icon: React.ReactNode, 
    tasks: Task[], 
    isActive: boolean
  ) => {
    if (tasks.length === 0) return null;
    
    return (
      <div className={`space-y-2 ${isActive ? 'ring-2 ring-primary/20 rounded-lg p-3 bg-primary/5' : ''}`}>
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          {icon}
          <span>{title}</span>
          {isActive && <Badge variant="outline" className="text-xs">Now</Badge>}
          <span className="ml-auto text-xs">{tasks.length} task{tasks.length !== 1 ? 's' : ''}</span>
        </div>
        <div className="space-y-2">
          {tasks.map(task => renderTaskCard(task))}
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Target className="w-6 h-6 text-primary" />
            Focus View
          </h1>
          <p className="text-muted-foreground mt-1">
            {format(now, 'EEEE, MMMM d, yyyy')} • {completedTodayCount} tasks completed today
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Column - Today's Schedule */}
          <div className="lg:col-span-2 space-y-4">
            {/* Overdue Alert */}
            {overdueTasks.length > 0 && (
              <Card className="border-destructive/50 bg-destructive/5">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-semibold text-destructive flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Overdue Tasks ({overdueTasks.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {overdueTasks.slice(0, 3).map(task => (
                    <div 
                      key={task.id}
                      className="p-3 bg-card border border-destructive/20 rounded-lg cursor-pointer hover:border-destructive/40 transition-all"
                      onClick={() => onTaskClick?.(task.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: task.color }}
                          />
                          <span className="font-medium text-sm">{task.title}</span>
                        </div>
                        <span className="text-xs text-destructive">
                          Due {format(new Date(task.dueDate!), 'MMM d')}
                        </span>
                      </div>
                    </div>
                  ))}
                  {overdueTasks.length > 3 && (
                    <p className="text-xs text-muted-foreground text-center pt-1">
                      +{overdueTasks.length - 3} more overdue
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Today's Schedule */}
            <Card className="border-primary/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold text-primary flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Today's Schedule
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-4">
                    {todayTasks.length === 0 ? (
                      <div className="text-center py-12">
                        <CheckCircle2 className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                        <p className="text-muted-foreground">No tasks scheduled for today!</p>
                        <p className="text-sm text-muted-foreground/70">Enjoy your free time or plan ahead.</p>
                      </div>
                    ) : (
                      <>
                        {renderTimeBlock(
                          'Morning', 
                          <Sunrise className="w-4 h-4" />, 
                          morningTasks, 
                          getCurrentTimeBlock() === 'morning'
                        )}
                        {renderTimeBlock(
                          'Afternoon', 
                          <Sun className="w-4 h-4" />, 
                          afternoonTasks, 
                          getCurrentTimeBlock() === 'afternoon'
                        )}
                        {renderTimeBlock(
                          'Evening', 
                          <Moon className="w-4 h-4" />, 
                          eveningTasks, 
                          getCurrentTimeBlock() === 'evening'
                        )}
                      </>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Due Today */}
            {dueTodayTasks.length > 0 && (
              <Card className="border-warning/30 bg-warning/5">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-semibold text-warning flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Due Today ({dueTodayTasks.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {dueTodayTasks.map(task => renderTaskCard(task, false))}
                </CardContent>
              </Card>
            )}

            {/* Active Alarms */}
            {activeAlarms.length > 0 && (
              <Card className="border-primary/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                    <Bell className="w-4 h-4 text-primary" />
                    Active Alarms
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {activeAlarms.map(alarm => (
                    <div 
                      key={alarm.id}
                      className="p-2 bg-muted/50 rounded-lg flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <Clock className="w-3 h-3 text-muted-foreground" />
                        <span className="text-sm font-medium">{alarm.time}</span>
                      </div>
                      <span className="text-xs text-muted-foreground truncate max-w-20">
                        {alarm.label}
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Upcoming Deadlines */}
            {upcomingDeadlines.length > 0 && (
              <Card className="border-primary/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                    <Target className="w-4 h-4 text-primary" />
                    Upcoming This Week
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {upcomingDeadlines.slice(0, 5).map(task => {
                    const project = getProject(task.projectId);
                    return (
                      <div 
                        key={task.id}
                        className="p-2 bg-muted/30 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => onTaskClick?.(task.id)}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium truncate flex-1">{task.title}</span>
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div className="flex items-center justify-between mt-1 text-xs text-muted-foreground">
                          <span>{format(new Date(task.dueDate!), 'EEE, MMM d')}</span>
                          {project && (
                            <span className="truncate max-w-20">{project.name}</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            )}

            {/* Quick Stats */}
            <Card className="border-primary/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold text-foreground">
                  Quick Stats
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-3 bg-muted/30 rounded-lg">
                    <div className="text-2xl font-bold text-primary">{todayTasks.length}</div>
                    <div className="text-xs text-muted-foreground">Today</div>
                  </div>
                  <div className="text-center p-3 bg-muted/30 rounded-lg">
                    <div className="text-2xl font-bold text-green-500">{completedTodayCount}</div>
                    <div className="text-xs text-muted-foreground">Done</div>
                  </div>
                  <div className="text-center p-3 bg-muted/30 rounded-lg">
                    <div className="text-2xl font-bold text-destructive">{overdueTasks.length}</div>
                    <div className="text-xs text-muted-foreground">Overdue</div>
                  </div>
                  <div className="text-center p-3 bg-muted/30 rounded-lg">
                    <div className="text-2xl font-bold text-foreground">{upcomingDeadlines.length}</div>
                    <div className="text-xs text-muted-foreground">This Week</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
