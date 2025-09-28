import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Task } from '../models/task';
import { TaskService } from '../shared/task.service';
import { AuthService } from '../shared/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.css']
})
export class TasksComponent implements OnInit, OnDestroy {
  tasks: Task[] = [];
  loading: boolean = true;
  errorMessage: string = '';
  newTask: Task = { title: '', description: '', status: 'PENDING' };
  showAddForm: boolean = false;
  showDeleteModal: boolean = false;
  editingTask: Task | null = null;
  taskToDelete: Task | null = null;

  constructor(
    private taskService: TaskService,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks(): void {
    this.loading = true;
    this.errorMessage = '';
    
    this.taskService.getAllTasks().subscribe({
      next: (tasks) => {
        this.tasks = tasks;
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load tasks. Please try again.';
        this.loading = false;
        console.error('Error loading tasks:', error);
      }
    });
  }

  toggleAddForm(): void {
    this.showAddForm = !this.showAddForm;
    if (this.showAddForm) {
      this.newTask = { title: '', description: '', status: 'PENDING' };
      this.editingTask = null;
      // Add class to body to prevent scrolling when modal is open
      document.body.style.overflow = 'hidden';
    } else {
      // Remove class when modal is closed
      document.body.style.overflow = '';
    }
  }

  startEditing(task: Task): void {
    this.editingTask = { ...task };
    this.newTask = { ...task };
    this.showAddForm = true;
  }

  isTitleDuplicate(title: string, excludeTaskId?: number): boolean {
    return this.tasks.some(task => 
      task.title.trim().toLowerCase() === title.trim().toLowerCase() && 
      task.id !== excludeTaskId
    );
  }

  private clearErrorMessageTimeout: any;

  private showTemporaryError(message: string) {
    this.errorMessage = message;
    // Clear any existing timeout
    if (this.clearErrorMessageTimeout) {
      clearTimeout(this.clearErrorMessageTimeout);
    }
    
    const alertElement = document.querySelector('.alert');
    if (alertElement) {
      alertElement.classList.remove('fade-out');
    }
    
    // Set new timeout to clear the message after 3 seconds
    this.clearErrorMessageTimeout = setTimeout(() => {
      if (alertElement) {
        alertElement.classList.add('fade-out');
        // Wait for fade out animation before removing the message
        setTimeout(() => {
          this.errorMessage = '';
        }, 300);
      } else {
        this.errorMessage = '';
      }
    }, 3000);
  }

  createTask(): void {
    // Ensure newTask and its properties are defined
    if (!this.newTask) {
      this.newTask = { title: '', description: '', status: 'PENDING' };
    }
    
    const trimmedTitle = (this.newTask.title || '').trim();
    if (!trimmedTitle) {
      this.showTemporaryError('Task title is required');
      return;
    }

    // Check title length
    if (trimmedTitle.length > 200) {
      this.showTemporaryError('Task title cannot exceed 200 characters');
      return;
    }

    // Ensure description is defined and trim it
    this.newTask.description = this.newTask.description || '';
    const trimmedDescription = this.newTask.description.trim();

    // Prepare the task with trimmed values
    this.newTask = {
      ...this.newTask,
      title: trimmedTitle,
      description: trimmedDescription
    };

    // Check for duplicate titles
    if (this.editingTask) {
      if (this.isTitleDuplicate(trimmedTitle, this.editingTask.id)) {
        this.showTemporaryError('A task with this title already exists');
        return;
      }
    } else {
      if (this.isTitleDuplicate(trimmedTitle)) {
        this.showTemporaryError('A task with this title already exists');
        return;
      }
    }

    this.loading = true;
    this.errorMessage = '';

    if (this.editingTask) {
      // Update existing task
      this.taskService.updateTask(this.editingTask.id!, this.newTask).subscribe({
        next: (updatedTask) => {
          // Update the task in the local array immediately
          const index = this.tasks.findIndex(t => t.id === this.editingTask!.id);
          if (index !== -1) {
            this.tasks[index] = updatedTask;
          }
          this.loading = false;
          this.toggleAddForm();
          // Then refresh from server to ensure sync
          this.loadTasks();
        },
        error: (error) => {
          this.errorMessage = 'Failed to update task. Please try again.';
          this.loading = false;
          console.error('Error updating task:', error);
          // Refresh to ensure UI is in sync with server
          this.loadTasks();
        }
      });
    } else {
      // Create new task
      this.taskService.createTask(this.newTask).subscribe({
        next: (newTask) => {
          // Reset loading state and close modal before refreshing
          this.loading = false;
          this.showAddForm = false;
          document.body.style.overflow = '';
          
          // Reset the form
          this.newTask = { title: '', description: '', status: 'PENDING' };
          
          // Refresh the task list
          this.loadTasks();
        },
        error: (error) => {
          this.errorMessage = 'Failed to create task. Please try again.';
          this.loading = false;
          console.error('Error creating task:', error);
        }
      });
    }
  }

  openDeleteModal(task: Task): void {
    this.taskToDelete = task;
    this.showDeleteModal = true;
    document.body.style.overflow = 'hidden';
  }

  cancelDelete(): void {
    this.taskToDelete = null;
    this.showDeleteModal = false;
    document.body.style.overflow = '';
  }

  confirmDelete(): void {
    if (!this.taskToDelete?.id) return;

    this.loading = true;
    this.errorMessage = '';
    
    this.taskService.deleteTask(this.taskToDelete.id).subscribe({
      next: () => {
        // Remove the task from the local array immediately
        this.tasks = this.tasks.filter(task => task.id !== this.taskToDelete?.id);
        this.loading = false;
        // Close the modal and reset state
        this.showDeleteModal = false;
        this.taskToDelete = null;
        document.body.style.overflow = '';
        // Then refresh from server to ensure sync
        this.loadTasks();
      },
      error: (error) => {
        this.errorMessage = typeof error === 'string' ? error : 'Failed to delete task. Please try again.';
        this.loading = false;
        console.error('Error deleting task:', error);
        // Close the modal
        this.showDeleteModal = false;
        this.taskToDelete = null;
        document.body.style.overflow = '';
        // Refresh the list to ensure UI is in sync with server
        this.loadTasks();
      }
    });
  }

  toggleTaskStatus(task: Task): void {
    const updatedTask: Task = {
      ...task,
      status: task.status === 'PENDING' ? 'COMPLETED' : 'PENDING'
    };
    
    // Update UI immediately for better user experience
    const taskIndex = this.tasks.findIndex(t => t.id === task.id);
    if (taskIndex !== -1) {
      this.tasks[taskIndex] = { ...updatedTask };
    }
    
    this.taskService.updateTask(task.id!, updatedTask).subscribe({
      next: (response) => {
        // Update with server response to ensure accuracy
        const index = this.tasks.findIndex(t => t.id === task.id);
        if (index !== -1) {
          this.tasks[index] = response;
        }
        // Refresh the full list to ensure sync
        this.loadTasks();
      },
      error: (error) => {
        this.errorMessage = 'Failed to update task status. Please try again.';
        console.error('Error updating task status:', error);
        // Revert the optimistic update and refresh from server
        this.loadTasks();
      }
    });
  }

  handlePaste(event: ClipboardEvent, field: 'title' | 'description', maxLength: number): void {
    // Prevent the default paste
    event.preventDefault();
    
    // Get the clipboard data
    const pastedText = event.clipboardData?.getData('text') || '';
    
    // Trim the text to the maximum length
    const trimmedText = pastedText.slice(0, maxLength);
    
    // Get the current value of the field
    const currentValue = this.newTask[field] || '';
    
    // Get cursor position
    const target = event.target as HTMLInputElement | HTMLTextAreaElement;
    const start = target.selectionStart || 0;
    const end = target.selectionEnd || 0;
    
    // Calculate the new value by combining:
    // 1. Text before cursor
    // 2. Pasted text (trimmed to max length)
    // 3. Text after cursor
    const newValue = 
      currentValue.substring(0, start) +
      trimmedText +
      currentValue.substring(end);
    
    // Ensure the final result doesn't exceed maxLength
    this.newTask[field] = newValue.slice(0, maxLength);
    
    // Update cursor position after paste
    setTimeout(() => {
      const newCursorPos = start + trimmedText.length;
      target.setSelectionRange(newCursorPos, newCursorPos);
    });
    
    // Show warning if text was trimmed
    if (pastedText.length > maxLength) {
      this.showTemporaryError(`Pasted text was trimmed to ${maxLength} characters`);
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  ngOnDestroy(): void {
    // Clear any existing timeout when component is destroyed
    if (this.clearErrorMessageTimeout) {
      clearTimeout(this.clearErrorMessageTimeout);
    }
  }
}