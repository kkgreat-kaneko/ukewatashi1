import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginInsJlxhsComponent } from './login-ins-jlxhs.component';

describe('LoginInsJlxhsComponent', () => {
  let component: LoginInsJlxhsComponent;
  let fixture: ComponentFixture<LoginInsJlxhsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LoginInsJlxhsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginInsJlxhsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
