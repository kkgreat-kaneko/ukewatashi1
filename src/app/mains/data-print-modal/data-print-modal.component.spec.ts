import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DataPrintModalComponent } from './data-print-modal.component';

describe('DataPrintModalComponent', () => {
  let component: DataPrintModalComponent;
  let fixture: ComponentFixture<DataPrintModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DataPrintModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DataPrintModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
