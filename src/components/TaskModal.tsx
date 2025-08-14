import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar as CalendarIcon, Clock, Tag } from 'lucide-react';
import { format } from 'date-fns';
import { Input as TimeInput } from '@/components/ui/input';

interface Project {
  id: string;
  name: string;
  color: string;
  category: 'hobby' | 'work' | 'personal';
}

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateTask: (task: any) => void;
  selectedTime?: Date;
  projects: Project[];
  preselectedProjectId?: string;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onCreateTask,
  selectedTime,
  projects,
  preselectedProjectId
}) => {
  const [taskData, setTaskData] = useState({
    title: '',
    description: '',
    projectId: preselectedProjectId || '',
    duration: 1,
    priority: 'medium'
  });

  const [customTime, setCustomTime] = useState(
    selectedTime ? format(selectedTime, 'HH:mm') : '09:00'
  );

  // Update projectId when preselectedProjectId changes
  React.useEffect(() => {
    if (preselectedProjectId) {
      setTaskData(prev => ({ ...prev, projectId: preselectedProjectId }));
    }
  }, [preselectedProjectId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskData.title || !taskData.projectId || !selectedTime) return;

    const selectedProject = projects.find(p => p.id === taskData.projectId);
    
    // Parse custom time and create new date with selected date + custom time
    const [hours, minutes] = customTime.split(':').map(Number);
    const finalStartTime = new Date(selectedTime);
    finalStartTime.setHours(hours, minutes, 0, 0);
    
    const task = {
      id: Date.now().toString(),
      title: taskData.title,
      description: taskData.description,
      projectId: taskData.projectId,
      startTime: finalStartTime,
      duration: taskData.duration,
      priority: taskData.priority,
      color: selectedProject?.color || '#3B82F6',
      completed: false
    };

    onCreateTask(task);
    onClose();
    setTaskData({
      title: '',
      description: '',
      projectId: '',
      duration: 1,
      priority: 'medium'
    });
    setCustomTime('09:00');
  };

  const priorities = [
    { value: 'low', label: 'Low', color: 'bg-accent/20' },
    { value: 'medium', label: 'Medium', color: 'bg-warning/20' },
    { value: 'high', label: 'High', color: 'bg-destructive/20' }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-gradient-card border-primary/20">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-xl">
            <CalendarIcon className="w-5 h-5 text-primary" />
            <span>Create New Task</span>
          </DialogTitle>
          {selectedTime && (
            <p className="text-sm text-muted-foreground">
              {format(selectedTime, 'EEEE, MMMM d, yyyy • HH:mm')}
            </p>
          )}
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="task-title" className="text-sm font-medium">Task Title</Label>
            <Input
              id="task-title"
              value={taskData.title}
              onChange={(e) => setTaskData({ ...taskData, title: e.target.value })}
              placeholder="What needs to be done?"
              className="border-primary/20 focus:ring-primary"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="task-description" className="text-sm font-medium">Description</Label>
            <Textarea
              id="task-description"
              value={taskData.description}
              onChange={(e) => setTaskData({ ...taskData, description: e.target.value })}
              placeholder="Add details about this task..."
              className="border-primary/20 focus:ring-primary min-h-[100px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="project-select" className="text-sm font-medium">Project</Label>
              <Select
                value={taskData.projectId}
                onValueChange={(value) => setTaskData({ ...taskData, projectId: value })}
                required
              >
                <SelectTrigger className="border-primary/20">
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map(project => (
                    <SelectItem key={project.id} value={project.id}>
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: project.color }}
                        />
                        <span>{project.name}</span>
                        <span className="text-xs text-muted-foreground capitalize">
                          ({project.category})
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration" className="text-sm font-medium flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>Duration (hours)</span>
              </Label>
              <Select
                value={taskData.duration.toString()}
                onValueChange={(value) => setTaskData({ ...taskData, duration: parseInt(value) })}
              >
                <SelectTrigger className="border-primary/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[0.5, 1, 1.5, 2, 3, 4, 6, 8].map(duration => (
                    <SelectItem key={duration} value={duration.toString()}>
                      {duration === 0.5 ? '30 min' : `${duration} hour${duration > 1 ? 's' : ''}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="start-time" className="text-sm font-medium flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>Start Time</span>
            </Label>
            <Input
              id="start-time"
              type="time"
              value={customTime}
              onChange={(e) => setCustomTime(e.target.value)}
              className="border-primary/20 focus:ring-primary"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center space-x-1">
              <Tag className="w-4 h-4" />
              <span>Priority</span>
            </Label>
            <div className="flex space-x-2">
              {priorities.map(priority => (
                <Button
                  key={priority.value}
                  type="button"
                  variant={taskData.priority === priority.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTaskData({ ...taskData, priority: priority.value })}
                  className={taskData.priority === priority.value ? "bg-primary" : ""}
                >
                  <div className={`w-2 h-2 rounded-full mr-2 ${priority.color}`} />
                  {priority.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <Button
              type="submit"
              className="flex-1 bg-gradient-primary text-white hover:shadow-glow transition-all duration-300"
            >
              Create Task
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