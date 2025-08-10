import React, { useState } from 'react';
import { CalendarGrid } from '@/components/CalendarGrid';
import { ProjectSidebar } from '@/components/ProjectSidebar';
import { AlarmPanel } from '@/components/AlarmPanel';
import { TaskModal } from '@/components/TaskModal';
import { ProjectModal } from '@/components/ProjectModal';
import { ProjectTasksModal } from '@/components/ProjectTasksModal';
import { Button } from '@/components/ui/button';
import { Calendar, Bell, Settings } from 'lucide-react';
import { addDays } from 'date-fns';

const Index = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState<Date | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isProjectTasksModalOpen, setIsProjectTasksModalOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string>();
  const [showAlarms, setShowAlarms] = useState(false);

  // Sample data - in a real app, this would come from a backend
  const [projects, setProjects] = useState([
    {
      id: '1',
      name: 'Learning Spanish',
      color: '#10B981',
      tasksCount: 12,
      completedTasks: 8,
      category: 'hobby' as const
    },
    {
      id: '2',
      name: 'Fitness Journey',
      color: '#F59E0B',
      tasksCount: 15,
      completedTasks: 10,
      category: 'personal' as const
    },
    {
      id: '3',
      name: 'React Development',
      color: '#3B82F6',
      tasksCount: 8,
      completedTasks: 3,
      category: 'work' as const
    }
  ]);

  const [tasks, setTasks] = useState([
    {
      id: '1',
      title: 'Spanish Vocabulary',
      projectId: '1',
      startTime: new Date(new Date().setHours(9, 0, 0, 0)),
      duration: 1,
      color: '#10B981',
      priority: 'medium',
      completed: false
    },
    {
      id: '2',
      title: 'Morning Workout',
      projectId: '2',
      startTime: new Date(new Date().setHours(7, 0, 0, 0)),
      duration: 1,
      color: '#F59E0B',
      priority: 'high',
      completed: false
    }
  ]);

  const [alarms, setAlarms] = useState([
    {
      id: '1',
      time: '06:30',
      enabled: true,
      sound: 'birds',
      label: 'Morning Wake-up',
      recurring: true
    }
  ]);

  const handleTimeSlotClick = (time: Date) => {
    setSelectedTime(time);
    setIsTaskModalOpen(true);
  };

  const handleCreateTask = (task: any) => {
    setTasks([...tasks, task]);
    // Update project task counts
    setProjects(projects.map(project => 
      project.id === task.projectId 
        ? { ...project, tasksCount: project.tasksCount + 1 }
        : project
    ));
  };

  const handleTaskUpdate = (updatedTasks: any[]) => {
    setTasks(updatedTasks);
    // Update project completion counts
    setProjects(projects.map(project => {
      const projectTasks = updatedTasks.filter(task => task.projectId === project.id);
      const completedTasks = projectTasks.filter(task => task.completed);
      return {
        ...project,
        tasksCount: projectTasks.length,
        completedTasks: completedTasks.length
      };
    }));
  };

  const handleCreateProject = (projectData: any) => {
    const newProject = {
      id: Date.now().toString(),
      ...projectData,
      tasksCount: 0,
      completedTasks: 0
    };
    setProjects([...projects, newProject]);
  };

  const handleProjectSelect = (projectId: string) => {
    setSelectedProjectId(projectId);
    setIsProjectTasksModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="bg-card border-b border-border shadow-soft">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-primary rounded-lg">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-foreground">Productive Calendar</h1>
                <p className="text-sm text-muted-foreground">Track your hobbies and projects</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant={showAlarms ? "default" : "outline"}
                size="sm"
                onClick={() => setShowAlarms(!showAlarms)}
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

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6 h-[calc(100vh-140px)]">
          {/* Project Sidebar */}
          <ProjectSidebar
            projects={projects}
            onCreateProject={() => setIsProjectModalOpen(true)}
            onProjectSelect={handleProjectSelect}
            selectedProjectId={selectedProjectId}
          />

          {/* Calendar Grid */}
          <div className="flex-1 flex flex-col">
            <CalendarGrid
              selectedDate={selectedDate}
              tasks={tasks}
              onTimeSlotClick={handleTimeSlotClick}
              currentTime={new Date()}
            />
          </div>

          {/* Alarm Panel (Conditional) */}
          {showAlarms && (
            <div className="w-80">
              <AlarmPanel
                alarms={alarms}
                onAlarmUpdate={setAlarms}
              />
            </div>
          )}
        </div>
      </div>

      {/* Task Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onCreateTask={handleCreateTask}
        selectedTime={selectedTime}
        projects={projects}
      />

      {/* Project Modal */}
      <ProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        onCreateProject={handleCreateProject}
      />

      {/* Project Tasks Modal */}
      <ProjectTasksModal
        isOpen={isProjectTasksModalOpen}
        onClose={() => setIsProjectTasksModalOpen(false)}
        project={projects.find(p => p.id === selectedProjectId) || null}
        tasks={tasks}
        onTaskUpdate={handleTaskUpdate}
      />
    </div>
  );
};

export default Index;
