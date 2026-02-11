import { create } from 'zustand';
import { Task } from '../types';

interface TaskStore {
  tasks: Task[];
  completedTaskIds: Set<string>;
  setTasks: (tasks: Task[]) => void;
  completeTask: (taskId: string) => void;
  updateTasks: (tasks: Task[]) => void;
  reset: () => void;
}

/**
 * Zustand store for managing task state
 * Handles task completion and dependency unlocking
 */
export const useTaskStore = create<TaskStore>((set) => ({
  tasks: [],
  completedTaskIds: new Set(),

  setTasks: (tasks: Task[]) =>
    set({
      tasks,
      completedTaskIds: new Set(
        tasks.filter((t) => t.status === 'completed').map((t) => t.taskId)
      ),
    }),

  completeTask: (taskId: string) =>
    set((state) => {
      // Mark task as completed
      const updatedTasks = state.tasks.map((task) =>
        task.taskId === taskId ? { ...task, status: 'completed' as const } : task
      );

      // Update completed IDs
      const newCompletedIds = new Set(state.completedTaskIds);
      newCompletedIds.add(taskId);

      // Recalculate task statuses based on dependencies
      const finalTasks = updatedTasks.map((task) => {
        if (task.status === 'completed' || task.status === 'error') {
          return task;
        }

        // Check if all dependencies are completed
        const hasUnmetDependencies = task.dependencies.some(
          (depId) => !newCompletedIds.has(depId)
        );

        return {
          ...task,
          status: hasUnmetDependencies ? ('blocked' as const) : ('ready' as const),
        };
      });

      return {
        tasks: finalTasks,
        completedTaskIds: newCompletedIds,
      };
    }),

  updateTasks: (tasks: Task[]) =>
    set({
      tasks,
      completedTaskIds: new Set(
        tasks.filter((t) => t.status === 'completed').map((t) => t.taskId)
      ),
    }),

  reset: () =>
    set({
      tasks: [],
      completedTaskIds: new Set(),
    }),
}));
