import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MainInsComponent } from './main-ins.component';

describe('MainInsComponent', () => {
  let component: MainInsComponent;
  let fixture: ComponentFixture<MainInsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MainInsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MainInsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
