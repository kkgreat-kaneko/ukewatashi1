import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PwdReprtConfirmModalComponent } from './pwd-reprt-confirm-modal.component';

describe('PwdReprtConfirmModalComponent', () => {
  let component: PwdReprtConfirmModalComponent;
  let fixture: ComponentFixture<PwdReprtConfirmModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PwdReprtConfirmModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PwdReprtConfirmModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
