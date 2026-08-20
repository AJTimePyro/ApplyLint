import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StageTracker } from './stage-tracker';

describe('StageTracker', () => {
  let component: StageTracker;
  let fixture: ComponentFixture<StageTracker>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StageTracker],
    }).compileComponents();

    fixture = TestBed.createComponent(StageTracker);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
