import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderComponent } from './header.component';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit search value', () => {
    const spy = jasmine.createSpy('search');
    component.search.subscribe(spy);

    component.onSearch('mew');

    expect(spy).toHaveBeenCalledWith('mew');
  });

  it('should emit toggle favorites', () => {
    const spy = jasmine.createSpy('toggleFavorites');
    component.toggleFavorites.subscribe(spy);

    component.onToggleFavorites();

    expect(spy).toHaveBeenCalled();
  });
});
