import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LetterCard } from './letter-card';

describe('LetterCard', () => {
  let component: LetterCard;
  let fixture: ComponentFixture<LetterCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LetterCard],
    }).compileComponents();

    fixture = TestBed.createComponent(LetterCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
