import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();
  
  if (token) {
    const authRequest = request.clone({
      headers: request.headers.set('Authorization', token)
    });
    return next(authRequest);
  }
  
  return next(request);
};