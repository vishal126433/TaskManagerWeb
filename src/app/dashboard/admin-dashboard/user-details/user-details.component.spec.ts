import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserDetailsComponent } from './user-details.component';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { UserService } from '../../../services/user.service';
import { of } from 'rxjs';

describe('UserDetailsComponent', () => {
  let component: UserDetailsComponent;
  let fixture: ComponentFixture<UserDetailsComponent>;

 

  beforeEach(async () => {
    const userServiceMock = {
      getUsers: jasmine.createSpy('getUsers').and.returnValue(of({ data: [{ id: 1, name: 'John Doe' }] }))
    };
  
    await TestBed.configureTestingModule({
      imports: [UserDetailsComponent], // standalone component
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({ id: '123' }), // mock route params
            queryParams: of({ tab: 'profile' }), // mock query params
            snapshot: { paramMap: { get: (key: string) => '123' } }
          }
        },
        { provide: UserService, useValue: userServiceMock }
      ]
    }).compileComponents();
  
    fixture = TestBed.createComponent(UserDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
  

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle isCollapsed when toggleSidebar is called', () => {
    expect(component.isCollapsed).toBeFalse();

    component.toggleSidebar();
    expect(component.isCollapsed).toBeTrue();

    component.toggleSidebar();
    expect(component.isCollapsed).toBeFalse();
  });

  it('should toggle the sidebar state', () => {
    component.isCollapsed = false; 
  
    component.toggleSidebar();
  
    expect(component.isCollapsed).toBeTrue();
  
    component.toggleSidebar();
  
    expect(component.isCollapsed).toBeFalse();
  });

 
  
});
