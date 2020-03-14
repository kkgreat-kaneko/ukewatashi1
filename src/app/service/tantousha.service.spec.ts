import { TestBed } from '@angular/core/testing';

import { TantoushaService } from './tantousha.service';

describe('TantoushaService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: TantoushaService = TestBed.get(TantoushaService);
    expect(service).toBeTruthy();
  });
});
