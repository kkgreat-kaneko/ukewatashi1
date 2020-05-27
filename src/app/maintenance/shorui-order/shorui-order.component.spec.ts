import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShoruiOrderComponent } from './shorui-order.component';

describe('ShoruiOrderComponent', () => {
  let component: ShoruiOrderComponent;
  let fixture: ComponentFixture<ShoruiOrderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShoruiOrderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShoruiOrderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
