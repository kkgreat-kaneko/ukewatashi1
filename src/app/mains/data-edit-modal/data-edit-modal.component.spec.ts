import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DataEditModalComponent } from './data-edit-modal.component';

describe('DataEditModalComponent', () => {
  let component: DataEditModalComponent;
  let fixture: ComponentFixture<DataEditModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DataEditModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DataEditModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
