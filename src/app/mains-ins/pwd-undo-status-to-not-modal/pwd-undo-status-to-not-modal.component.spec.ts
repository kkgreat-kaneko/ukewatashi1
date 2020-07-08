import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PwdUndoStatusToNotModalComponent } from './pwd-undo-status-to-not-modal.component';

describe('PwdUndoStatusToNotModalComponent', () => {
  let component: PwdUndoStatusToNotModalComponent;
  let fixture: ComponentFixture<PwdUndoStatusToNotModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PwdUndoStatusToNotModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PwdUndoStatusToNotModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
