import { TestBed } from '@angular/core/testing';

import { HokengaishaListService } from './hokengaisha-list.service';

describe('HokengaishaListService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: HokengaishaListService = TestBed.get(HokengaishaListService);
    expect(service).toBeTruthy();
  });
});
