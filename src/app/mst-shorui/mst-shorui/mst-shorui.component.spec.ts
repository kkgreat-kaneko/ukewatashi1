import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MstShoruiComponent } from './mst-shorui.component';

describe('MstShoruiComponent', () => {
  let component: MstShoruiComponent;
  let fixture: ComponentFixture<MstShoruiComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MstShoruiComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MstShoruiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
