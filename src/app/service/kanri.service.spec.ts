import { TestBed } from '@angular/core/testing';

import { KanriService } from './kanri.service';

describe('KanriService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: KanriService = TestBed.get(KanriService);
    expect(service).toBeTruthy();
  });
});
