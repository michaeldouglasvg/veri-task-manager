import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { User } from '../models/user';
import { AuthResponse } from '../models/auth-response';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'http://localhost:8082/auth';

  constructor(private http: HttpClient) { }

  register(user: User): Observable<string> {
    return this.http.post(`${this.baseUrl}/register`, user, { responseType: 'text' })
      .pipe(
        catchError(this.handleError)
      );
  }

  login(credentials: { username: string, password: string }): Observable<AuthResponse> {
    return this.http.post<{ token: string, type: string }>(`${this.baseUrl}/login`, credentials)
      .pipe(
        map(response => {
          // Store complete token with type in localStorage
          const token = `${response.type} ${response.token}`;
          localStorage.setItem('token', token);
          return { token } as AuthResponse;
        }),
        catchError(this.handleError)
      );
  }

  logout(): void {
    localStorage.removeItem('token');
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  private handleError(error: HttpErrorResponse) {
    console.error('An error occurred:', error);
    if (error.error instanceof ErrorEvent) {
      return throwError(() => error.error.message || 'An error occurred');
    } else {
      return throwError(() => 
        typeof error.error === 'string' ? error.error : 'Invalid username or password'
      );
    }
  }
}