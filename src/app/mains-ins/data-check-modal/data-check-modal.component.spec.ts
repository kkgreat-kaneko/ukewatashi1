import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DataCheckModalComponent } from './data-check-modal.component';

describe('DataCheckModalComponent', () => {
  let component: DataCheckModalComponent;
  let fixture: ComponentFixture<DataCheckModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DataCheckModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DataCheckModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
