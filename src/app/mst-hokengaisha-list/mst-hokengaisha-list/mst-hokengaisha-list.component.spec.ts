import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MstHokengaishaListComponent } from './mst-hokengaisha-list.component';

describe('MstHokengaishaListComponent', () => {
  let component: MstHokengaishaListComponent;
  let fixture: ComponentFixture<MstHokengaishaListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MstHokengaishaListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MstHokengaishaListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
