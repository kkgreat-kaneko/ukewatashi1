import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DataApproveMultiModalComponent } from './data-approve-multi-modal.component';

describe('DataApproveMultiModalComponent', () => {
  let component: DataApproveMultiModalComponent;
  let fixture: ComponentFixture<DataApproveMultiModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DataApproveMultiModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DataApproveMultiModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
