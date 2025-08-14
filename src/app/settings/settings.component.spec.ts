import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SettingsComponent } from './settings.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { HttpClient } from '@angular/common/http';

describe('SettingsComponent', () => {
  let component: SettingsComponent;
  let fixture: ComponentFixture<SettingsComponent>;
  let httpMock: jasmine.SpyObj<HttpClient>;
  let alertSpy: jasmine.Spy;

  beforeEach(async () => {
    httpMock = jasmine.createSpyObj('HttpClient', ['put']);
    alertSpy = spyOn(window, 'alert');

    await TestBed.configureTestingModule({
      imports: [SettingsComponent], // standalone component
      providers: [
        { provide: HttpClient, useValue: httpMock },
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({ id: '123' }),
            queryParams: of({ tab: 'profile' }),
            snapshot: { paramMap: { get: (key: string) => '123' } }
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle sidebar', () => {
    const initial = component.isCollapsed;
    component.toggleSidebar();
    expect(component.isCollapsed).toBe(!initial);
  });

  it('should clear fields', () => {
    component.newPassword = 'new';
    component.oldPassword = 'old';
    component.confirmPassword = 'confirm';
    component.clearFields();
    expect(component.newPassword).toBe('');
    expect(component.oldPassword).toBe('');
    expect(component.confirmPassword).toBe('');
  });

  describe('extractUsernameFromToken', () => {
    it('should extract username from valid token', () => {
      const payload = {
        "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name": 'testuser'
      };
      const token = `header.${btoa(JSON.stringify(payload))}.signature`;
      spyOn(sessionStorage, 'getItem').and.returnValue(token);

      component.extractUsernameFromToken();
      expect(component.username).toBe('testuser');
    });

    it('should handle invalid token', () => {
      spyOn(sessionStorage, 'getItem').and.returnValue('invalid.token.value');
      spyOn(console, 'error');
      component.extractUsernameFromToken();
      expect(console.error).toHaveBeenCalled();
    });

    it('should do nothing if no token', () => {
      spyOn(sessionStorage, 'getItem').and.returnValue(null);
      component.extractUsernameFromToken();
      expect(component.username).toBe('');
    });
  });

  describe('changePassword', () => {
    it('should alert if passwords are empty', () => {
      component.newPassword = '';
      component.confirmPassword = '';
      component.changePassword();
      expect(alertSpy).toHaveBeenCalledWith('Please fill in both password fields.');
      expect(httpMock.put).not.toHaveBeenCalled();
    });

    it('should alert if passwords do not match', () => {
      component.newPassword = 'abc';
      component.confirmPassword = 'xyz';
      component.changePassword();
      expect(alertSpy).toHaveBeenCalledWith('Passwords do not match.');
      expect(httpMock.put).not.toHaveBeenCalled();
    });

    it('should call API and clear fields on success', () => {
      component.username = 'user1';
      component.oldPassword = 'old';
      component.newPassword = 'pass';
      component.confirmPassword = 'pass';
      httpMock.put.and.returnValue(of({}));

      spyOn(component, 'clearFields');

      component.changePassword();
      expect(httpMock.put).toHaveBeenCalled();
      expect(alertSpy).toHaveBeenCalledWith('Password changed successfully.');
      expect(component.clearFields).toHaveBeenCalled();
    });

    it('should handle API error', () => {
      component.username = 'user1';
      component.oldPassword = 'old';
      component.newPassword = 'pass';
      component.confirmPassword = 'pass';
      httpMock.put.and.returnValue(of({ error: 'failed' })); // will not trigger error block without throw
      spyOn(console, 'error');

      // Force error via throw
      httpMock.put.and.returnValue({
        subscribe: (obs: any) => obs.error('error')
      } as any);

      component.changePassword();
      expect(console.error).toHaveBeenCalledWith('Error changing password:', 'error');
    });
  });
});
