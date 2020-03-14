import { TestBed } from '@angular/core/testing';

import { KanriDelService } from './kanri-del.service';

describe('KanriDelService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: KanriDelService = TestBed.get(KanriDelService);
    expect(service).toBeTruthy();
  });
});
