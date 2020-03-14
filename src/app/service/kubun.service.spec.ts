import { TestBed } from '@angular/core/testing';

import { KubunService } from './kubun.service';

describe('KubunService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: KubunService = TestBed.get(KubunService);
    expect(service).toBeTruthy();
  });
});
