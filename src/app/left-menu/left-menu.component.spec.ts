import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LeftMenuComponent } from './left-menu.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

describe('LeftMenuComponent', () => {
  let component: LeftMenuComponent;
  let fixture: ComponentFixture<LeftMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LeftMenuComponent], // standalone component
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({ id: '123' }), // mock route params
            queryParams: of({ tab: 'profile' }), // mock query params
            snapshot: { paramMap: { get: (key: string) => '123' } }
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LeftMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
