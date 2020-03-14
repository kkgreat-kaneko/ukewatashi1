import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DataCreateModalComponent } from './data-create-modal.component';

describe('DataCreateModalComponent', () => {
  let component: DataCreateModalComponent;
  let fixture: ComponentFixture<DataCreateModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DataCreateModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DataCreateModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
