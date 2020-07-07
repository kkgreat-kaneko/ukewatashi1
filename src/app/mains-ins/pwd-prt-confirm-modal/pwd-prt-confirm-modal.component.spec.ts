import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PwdPrtConfirmModalComponent } from './pwd-prt-confirm-modal.component';

describe('PwdPrtConfirmModalComponent', () => {
  let component: PwdPrtConfirmModalComponent;
  let fixture: ComponentFixture<PwdPrtConfirmModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PwdPrtConfirmModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PwdPrtConfirmModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
