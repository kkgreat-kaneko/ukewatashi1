import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DataDeleteModalComponent } from './data-delete-modal.component';

describe('DataDeleteModalComponent', () => {
  let component: DataDeleteModalComponent;
  let fixture: ComponentFixture<DataDeleteModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DataDeleteModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DataDeleteModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
