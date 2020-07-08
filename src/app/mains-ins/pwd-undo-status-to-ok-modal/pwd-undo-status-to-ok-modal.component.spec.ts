import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PwdUndoStatusToOkModalComponent } from './pwd-undo-status-to-ok-modal.component';

describe('PwdUndoStatusToOkModalComponent', () => {
  let component: PwdUndoStatusToOkModalComponent;
  let fixture: ComponentFixture<PwdUndoStatusToOkModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PwdUndoStatusToOkModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PwdUndoStatusToOkModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
