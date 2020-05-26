import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { KubunOrderComponent } from './kubun-order.component';

describe('KubunOrderComponent', () => {
  let component: KubunOrderComponent;
  let fixture: ComponentFixture<KubunOrderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ KubunOrderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KubunOrderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
