import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MstHokengaishaComponent } from './mst-hokengaisha.component';

describe('MstHokengaishaComponent', () => {
  let component: MstHokengaishaComponent;
  let fixture: ComponentFixture<MstHokengaishaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MstHokengaishaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MstHokengaishaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
