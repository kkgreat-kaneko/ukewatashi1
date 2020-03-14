import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DataApproveSingleModalComponent } from './data-approve-single-modal.component';

describe('DataApproveSingleModalComponent', () => {
  let component: DataApproveSingleModalComponent;
  let fixture: ComponentFixture<DataApproveSingleModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DataApproveSingleModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DataApproveSingleModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
