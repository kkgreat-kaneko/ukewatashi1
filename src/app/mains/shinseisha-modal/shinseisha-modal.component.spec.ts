import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShinseishaModalComponent } from './shinseisha-modal.component';

describe('ShinseishaModalComponent', () => {
  let component: ShinseishaModalComponent;
  let fixture: ComponentFixture<ShinseishaModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShinseishaModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShinseishaModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
