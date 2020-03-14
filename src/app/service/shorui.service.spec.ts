import { TestBed } from '@angular/core/testing';

import { ShoruiService } from './shorui.service';

describe('ShoruiService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ShoruiService = TestBed.get(ShoruiService);
    expect(service).toBeTruthy();
  });
});
