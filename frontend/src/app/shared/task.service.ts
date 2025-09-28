import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Task } from '../models/task';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private baseUrl = 'http://localhost:8082/api/tasks';

  constructor(private http: HttpClient) { }

  getAllTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(this.baseUrl)
      .pipe(
        catchError(this.handleError)
      );
  }

  getTaskById(id: number): Observable<Task> {
    return this.http.get<Task>(`${this.baseUrl}/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  createTask(task: Task): Observable<Task> {
    return this.http.post<Task>(this.baseUrl, task)
      .pipe(
        catchError(this.handleError)
      );
  }

  updateTask(id: number, task: Task): Observable<Task> {
    return this.http.put<Task>(`${this.baseUrl}/${id}`, task)
      .pipe(
        catchError(this.handleError)
      );
  }

  deleteTask(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`)
      .pipe(
        map(() => ({ message: 'Task deleted successfully' })),
        catchError(error => {
          if (error.status === 404) {
            return throwError(() => 'Task not found or already deleted');
          }
          return throwError(() => error.error?.message || 'Failed to delete task');
        })
      );
  }

  private handleError(error: any) {
    console.error('An error occurred:', error);
    return throwError(() => error.error?.message || error.message || 'Server error');
  }
}