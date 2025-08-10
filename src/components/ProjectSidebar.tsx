import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Plus, Calendar, Clock, Target } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Project {
  id: string;
  name: string;
  color: string;
  tasksCount: number;
  completedTasks: number;
  category: 'hobby' | 'work' | 'personal';
}

interface ProjectSidebarProps {
  projects: Project[];
  onCreateProject: () => void;
  onProjectSelect: (projectId: string) => void;
  selectedProjectId?: string;
}

export const ProjectSidebar: React.FC<ProjectSidebarProps> = ({
  projects,
  onCreateProject,
  onProjectSelect,
  selectedProjectId
}) => {
  const getCategoryIcon = (category: Project['category']) => {
    switch (category) {
      case 'hobby': return <Target className="w-4 h-4" />;
      case 'work': return <Calendar className="w-4 h-4" />;
      case 'personal': return <Clock className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: Project['category']) => {
    switch (category) {
      case 'hobby': return 'bg-accent/20 text-accent-foreground';
      case 'work': return 'bg-primary/20 text-primary-foreground';
      case 'personal': return 'bg-success/20 text-success';
    }
  };

  return (
    <div className="w-80 bg-gradient-subtle border-r border-border p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">Projects</h2>
        <Button 
          onClick={onCreateProject}
          size="sm"
          className="bg-gradient-primary text-white hover:shadow-glow transition-all duration-300"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Project
        </Button>
      </div>

      {/* Project List */}
      <div className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto">
        {projects.map(project => {
          const progress = project.tasksCount > 0 
            ? (project.completedTasks / project.tasksCount) * 100 
            : 0;

          return (
            <Card
              key={project.id}
              className={cn(
                "cursor-pointer transition-all duration-200 hover:shadow-medium border",
                selectedProjectId === project.id 
                  ? "ring-2 ring-primary bg-primary/5 border-primary/30" 
                  : "hover:border-primary/20"
              )}
              onClick={() => onProjectSelect(project.id)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: project.color }}
                    />
                    <CardTitle className="text-sm font-medium truncate">
                      {project.name}
                    </CardTitle>
                  </div>
                  <Badge 
                    variant="secondary" 
                    className={cn("text-xs", getCategoryColor(project.category))}
                  >
                    <div className="flex items-center space-x-1">
                      {getCategoryIcon(project.category)}
                      <span className="capitalize">{project.category}</span>
                    </div>
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{project.completedTasks}/{project.tasksCount} tasks</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <Progress 
                    value={progress} 
                    className="h-2 bg-secondary/50"
                  />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Stats */}
      <Card className="bg-gradient-card border-primary/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-primary">Today's Overview</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-foreground">
                {projects.reduce((acc, p) => acc + p.tasksCount, 0)}
              </div>
              <div className="text-xs text-muted-foreground">Total Tasks</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-accent">
                {projects.reduce((acc, p) => acc + p.completedTasks, 0)}
              </div>
              <div className="text-xs text-muted-foreground">Completed</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};