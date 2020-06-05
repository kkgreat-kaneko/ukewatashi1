import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DataHokenPrintModalComponent } from './data-hoken-print-modal.component';

describe('DataHokenPrintModalComponent', () => {
  let component: DataHokenPrintModalComponent;
  let fixture: ComponentFixture<DataHokenPrintModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DataHokenPrintModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DataHokenPrintModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
