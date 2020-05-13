import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupAlertYesNoComponent } from './popup-alert-yes-no.component';

describe('PopupAlertYesNoComponent', () => {
  let component: PopupAlertYesNoComponent;
  let fixture: ComponentFixture<PopupAlertYesNoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PopupAlertYesNoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PopupAlertYesNoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
