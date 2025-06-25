import { PeriodicElement } from './element-data.constant';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';
import { computed } from '@angular/core';

interface ElementDataState {
  elements: PeriodicElement[];
  filter: string;
}

const initialState: ElementDataState = {
  elements: [],
  filter: '',
};

export const ElementDataStore = signalStore(
  withState(initialState),
  withComputed(({ elements, filter }) => ({
    filteredElements: computed(() => {
      return elements().filter((element) => {
        // case-insensitive
        const f = filter().toLowerCase();
        return (
          element.position.toString().includes(f) ||
          element.name.toLowerCase().includes(f) ||
          element.symbol.toLowerCase().includes(f) ||
          element.weight.toString().includes(f)
        );
      });
    }),
  })),
  withMethods((store) => ({
    updateElements(elements: PeriodicElement[]): void {
      patchState(store, () => ({
        elements,
      }));
    },
    updateElement(element: PeriodicElement): void {
      patchState(store, (state) => {
        return {
          elements: state.elements.map((el) =>
            el.position === element.position ? element : el,
          ),
        };
      });
    },
    updateFilter(filter: string): void {
      patchState(store, () => {
        return {
          filter,
        };
      });
    },
  })),
);
