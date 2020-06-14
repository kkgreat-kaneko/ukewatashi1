import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MstKubunComponent } from './mst-kubun.component';

describe('MstKubunComponent', () => {
  let component: MstKubunComponent;
  let fixture: ComponentFixture<MstKubunComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MstKubunComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MstKubunComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
