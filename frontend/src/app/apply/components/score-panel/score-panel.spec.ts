import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScorePanel } from './score-panel';

describe('ScorePanel', () => {
  let component: ScorePanel;
  let fixture: ComponentFixture<ScorePanel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScorePanel],
    }).compileComponents();

    fixture = TestBed.createComponent(ScorePanel);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
