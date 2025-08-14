import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthGuard } from './auth.guard';
import { Router } from '@angular/router';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [AuthGuard]
    });
    guard = TestBed.inject(AuthGuard);
    router = TestBed.inject(Router);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it('should return false and navigate to login if not logged in', () => {
    spyOn(sessionStorage, 'getItem').and.returnValue(null); // simulate not logged in
    const navigateSpy = spyOn(router, 'navigate');
    const result = guard.canActivate();
    expect(result).toBeFalse();
    expect(navigateSpy).toHaveBeenCalledWith(['/']);
  });

  it('should return true if logged in', () => {
    spyOn(sessionStorage, 'getItem').and.returnValue('mock-token'); // simulate logged in
    const result = guard.canActivate();
    expect(result).toBeTrue();
  });
});
