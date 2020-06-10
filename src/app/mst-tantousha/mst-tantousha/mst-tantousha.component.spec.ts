import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MstTantoushaComponent } from './mst-tantousha.component';

describe('MstTantoushaComponent', () => {
  let component: MstTantoushaComponent;
  let fixture: ComponentFixture<MstTantoushaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MstTantoushaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MstTantoushaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
