import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginInsJlxComponent } from './login-ins-jlx.component';

describe('LoginInsJlxComponent', () => {
  let component: LoginInsJlxComponent;
  let fixture: ComponentFixture<LoginInsJlxComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LoginInsJlxComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginInsJlxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
