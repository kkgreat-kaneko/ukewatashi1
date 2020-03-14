import { TestBed } from '@angular/core/testing';

import { HokengaishaService } from './hokengaisha.service';

describe('HokengaishaService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: HokengaishaService = TestBed.get(HokengaishaService);
    expect(service).toBeTruthy();
  });
});
