import { TestBed } from '@angular/core/testing';

import { KanriTableService } from './kanri-table.service';

describe('KanriTableService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: KanriTableService = TestBed.get(KanriTableService);
    expect(service).toBeTruthy();
  });
});
