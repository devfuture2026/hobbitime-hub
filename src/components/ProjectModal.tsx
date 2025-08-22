import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Folder, Target, Calendar, Clock } from 'lucide-react';

interface Project {
  id: string;
  name: string;
  color: string;
  tasksCount: number;
  completedTasks: number;
  category: 'hobby' | 'work' | 'personal';
  area: string;
}

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateProject: (project: Omit<Project, 'id' | 'tasksCount' | 'completedTasks'>) => void;
  lockedArea?: string;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({
  isOpen,
  onClose,
  onCreateProject,
  lockedArea
}) => {
  const [projectData, setProjectData] = useState({
    name: '',
    color: '#3B82F6',
    category: 'personal' as 'hobby' | 'work' | 'personal',
    area: lockedArea || 'Development',
    description: 'hello there mate'
  });

  const colors = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
    '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
  ];

  const categories = [
    { value: 'hobby', label: 'Hobby', icon: Target },
    { value: 'work', label: 'Work', icon: Calendar },
    { value: 'personal', label: 'Personal', icon: Clock }
  ];

  const areas = [
    'Development',
    'Wellness',
    'Chores',
    'Education',
    'Community',
    'Leisure',
    'Finance',
    'Mindfulness'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectData.name) return;

    onCreateProject(projectData);
    onClose();
    setProjectData({
      name: '',
      color: '#3B82F6',
      category: 'personal',
      area: lockedArea || 'Development'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px] bg-gradient-card border-primary/20">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-xl">
            <Folder className="w-5 h-5 text-primary" />
            <span>Create New Project</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="project-name" className="text-sm font-medium">Project Name</Label>
            <Input
              id="project-name"
              value={projectData.name}
              onChange={(e) => setProjectData({ ...projectData, name: e.target.value })}
              placeholder="Enter project name"
              className="border-primary/20 focus:ring-primary"
              required
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Category</Label>
            <Select
              value={projectData.category}
              onValueChange={(value: 'hobby' | 'work' | 'personal') => 
                setProjectData({ ...projectData, category: value })
              }
            >
              <SelectTrigger className="border-primary/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => {
                  const Icon = category.icon;
                  return (
                    <SelectItem key={category.value} value={category.value}>
                      <div className="flex items-center space-x-2">
                        <Icon className="w-4 h-4" />
                        <span>{category.label}</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Area</Label>
            <Select
              value={projectData.area}
              onValueChange={(value: string) => 
                setProjectData({ ...projectData, area: value })
              }
              disabled={Boolean(lockedArea)}
            >
              <SelectTrigger className="border-primary/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {areas.map(a => (
                  <SelectItem key={a} value={a}>{a}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Color</Label>
            <div className="grid grid-cols-5 gap-2">
              {colors.map(color => (
                <button
                  key={color}
                  type="button"
                  className={`w-10 h-10 rounded-lg border-2 transition-all duration-200 ${
                    projectData.color === color 
                      ? 'border-primary ring-2 ring-primary/20 scale-110' 
                      : 'border-border hover:border-primary/50'
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setProjectData({ ...projectData, color })}
                />
              ))}
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <Button
              type="submit"
              className="flex-1 bg-gradient-primary text-white hover:shadow-glow transition-all duration-300"
            >
              Create Project
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-primary/20"
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};