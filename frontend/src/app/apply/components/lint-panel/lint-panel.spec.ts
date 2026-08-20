import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LintPanel } from './lint-panel';

describe('LintPanel', () => {
  let component: LintPanel;
  let fixture: ComponentFixture<LintPanel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LintPanel],
    }).compileComponents();

    fixture = TestBed.createComponent(LintPanel);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
