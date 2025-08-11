import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Clock, Target, Calendar } from 'lucide-react';
import { format, isToday, startOfDay, isBefore, isAfter } from 'date-fns';
import { cn } from '@/lib/utils';

interface Task {
  id: string;
  title: string;
  projectId: string;
  startTime: Date;
  duration: number;
  color: string;
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
}

interface Project {
  id: string;
  name: string;
  color: string;
  category: 'hobby' | 'work' | 'personal';
}

interface TodayOverviewProps {
  tasks: Task[];
  projects: Project[];
}

export const TodayOverview: React.FC<TodayOverviewProps> = ({ tasks, projects }) => {
  const todayTasks = tasks.filter(task => isToday(task.startTime));
  const completedTasks = todayTasks.filter(task => task.completed);
  const completionRate = todayTasks.length > 0 ? (completedTasks.length / todayTasks.length) * 100 : 0;
  
  const upcomingTasks = todayTasks
    .filter(task => !task.completed && isAfter(task.startTime, new Date()))
    .sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
    .slice(0, 5);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-destructive/20 text-destructive border-destructive/30';
      case 'medium': return 'bg-warning/20 text-warning border-warning/30';
      case 'low': return 'bg-success/20 text-success border-success/30';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'work': return <Calendar className="w-3 h-3" />;
      case 'hobby': return <Target className="w-3 h-3" />;
      case 'personal': return <Clock className="w-3 h-3" />;
      default: return <Clock className="w-3 h-3" />;
    }
  };

  return (
    <div className="w-80 space-y-4">
      {/* Daily Progress Ring */}
      <Card className="bg-gradient-card border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-primary flex items-center">
            <Target className="w-5 h-5 mr-2" />
            Today's Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center mb-4">
            <div className="relative w-24 h-24">
              {/* Progress Ring */}
              <svg className="transform -rotate-90 w-24 h-24">
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="hsl(var(--muted))"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="hsl(var(--primary))"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  strokeDashoffset={`${2 * Math.PI * 40 * (1 - completionRate / 100)}`}
                  className="transition-all duration-500"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-primary">{Math.round(completionRate)}%</span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-xl font-bold text-foreground">{todayTasks.length}</div>
              <div className="text-xs text-muted-foreground">Total Tasks</div>
            </div>
            <div>
              <div className="text-xl font-bold text-accent">{completedTasks.length}</div>
              <div className="text-xs text-muted-foreground">Completed</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Events */}
      <Card className="bg-gradient-card border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-primary flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            Upcoming Events
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 max-h-96 overflow-y-auto">
          {upcomingTasks.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No upcoming events today</p>
            </div>
          ) : (
            upcomingTasks.map(task => {
              const project = projects.find(p => p.id === task.projectId);
              return (
                <div key={task.id} className="p-3 rounded-lg border border-border bg-card hover:shadow-soft transition-shadow">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: task.color }}
                      />
                      <span className="font-medium text-sm text-foreground truncate">
                        {task.title}
                      </span>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={cn("text-xs px-2 py-0.5", getPriorityColor(task.priority))}
                    >
                      {task.priority}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{format(task.startTime, 'HH:mm')}</span>
                      <span>({task.duration}h)</span>
                    </div>
                    
                    {project && (
                      <div className="flex items-center space-x-1">
                        {getCategoryIcon(project.category)}
                        <span className="truncate max-w-20" title={project.name}>
                          {project.name}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
};