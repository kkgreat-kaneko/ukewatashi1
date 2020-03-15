import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HokengaishaListOrderComponent } from './hokengaisha-list-order.component';

describe('HokengaishaListOrderComponent', () => {
  let component: HokengaishaListOrderComponent;
  let fixture: ComponentFixture<HokengaishaListOrderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HokengaishaListOrderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HokengaishaListOrderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
