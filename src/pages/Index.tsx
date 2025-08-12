import React, { useState, useEffect } from 'react';
import { CalendarGrid } from '@/components/CalendarGrid';
import { ProjectSidebar } from '@/components/ProjectSidebar';
import { AlarmPanel } from '@/components/AlarmPanel';
import { TaskModal } from '@/components/TaskModal';
import { ProjectModal } from '@/components/ProjectModal';
import { ProjectTasksModal } from '@/components/ProjectTasksModal';
import { Header } from '@/components/Header';
import { TodayOverview } from '@/components/TodayOverview';
import { addDays, startOfToday, addWeeks, addMonths, subWeeks, subMonths, subDays } from 'date-fns';

type ViewMode = 'day' | 'week' | 'month';

const Index = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState<Date | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isProjectTasksModalOpen, setIsProjectTasksModalOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string>();
  const [quickAddProjectId, setQuickAddProjectId] = useState<string>();
  const [showAlarms, setShowAlarms] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [darkMode, setDarkMode] = useState(false);
  const [timezone, setTimezone] = useState('America/New_York');

  // Apply dark mode to document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

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
      priority: 'medium' as const,
      completed: false
    },
    {
      id: '2',
      title: 'Morning Workout',
      projectId: '2',
      startTime: new Date(new Date().setHours(7, 0, 0, 0)),
      duration: 1,
      color: '#F59E0B',
      priority: 'high' as const,
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

  const handleQuickAddTask = (projectId: string) => {
    setQuickAddProjectId(projectId);
    setSelectedTime(new Date());
    setIsTaskModalOpen(true);
  };

  const handleGoToToday = () => {
    setSelectedDate(startOfToday());
  };

  const handleNavigatePrevious = () => {
    switch (viewMode) {
      case 'day':
        setSelectedDate(prev => subDays(prev, 1));
        break;
      case 'week':
        setSelectedDate(prev => subWeeks(prev, 1));
        break;
      case 'month':
        setSelectedDate(prev => subMonths(prev, 1));
        break;
    }
  };

  const handleNavigateNext = () => {
    switch (viewMode) {
      case 'day':
        setSelectedDate(prev => addDays(prev, 1));
        break;
      case 'week':
        setSelectedDate(prev => addWeeks(prev, 1));
        break;
      case 'month':
        setSelectedDate(prev => addMonths(prev, 1));
        break;
    }
  };

  const handleTaskDrop = (taskId: string, newTime: Date) => {
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === taskId 
          ? { ...task, startTime: newTime }
          : task
      )
    );
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Enhanced Header */}
      <Header
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        showAlarms={showAlarms}
        onToggleAlarms={() => setShowAlarms(!showAlarms)}
        onGoToToday={handleGoToToday}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onNavigatePrevious={handleNavigatePrevious}
        onNavigateNext={handleNavigateNext}
        darkMode={darkMode}
        onDarkModeToggle={() => setDarkMode(!darkMode)}
        timezone={timezone}
        onTimezoneChange={setTimezone}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6 h-[calc(100vh-140px)]">
          {/* Project Sidebar */}
          <ProjectSidebar
            projects={projects}
            onCreateProject={() => setIsProjectModalOpen(true)}
            onProjectSelect={handleProjectSelect}
            onQuickAddTask={handleQuickAddTask}
            selectedProjectId={selectedProjectId}
          />

          {/* Calendar Grid */}
          <div className="flex-1 flex flex-col">
            <CalendarGrid
              selectedDate={selectedDate}
              tasks={tasks}
              onTimeSlotClick={handleTimeSlotClick}
              onTaskDrop={handleTaskDrop}
              onDateChange={setSelectedDate}
              currentTime={new Date()}
              viewMode={viewMode}
            />
          </div>

          {/* Today's Overview Panel */}
          <TodayOverview
            tasks={tasks}
            projects={projects}
          />

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
        onClose={() => {
          setIsTaskModalOpen(false);
          setQuickAddProjectId(undefined);
        }}
        onCreateTask={handleCreateTask}
        selectedTime={selectedTime}
        projects={projects}
        preselectedProjectId={quickAddProjectId}
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
