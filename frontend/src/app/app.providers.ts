import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { Provider, EnvironmentProviders } from '@angular/core';
import { authGuard } from './shared/auth.guard';
import { authInterceptor } from './shared/auth.interceptor';

export const appProviders: (Provider | EnvironmentProviders)[] = [
  provideHttpClient(
    withInterceptors([authInterceptor])
  )
];
