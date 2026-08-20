import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CarouselNav } from './carousel-nav';

describe('CarouselNav', () => {
  let component: CarouselNav;
  let fixture: ComponentFixture<CarouselNav>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CarouselNav],
    }).compileComponents();

    fixture = TestBed.createComponent(CarouselNav);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
