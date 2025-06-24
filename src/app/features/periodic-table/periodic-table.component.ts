import { Component, DestroyRef, OnInit, signal, inject } from '@angular/core';
import {
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow,
  MatRowDef,
  MatTable,
  MatTextColumn,
} from '@angular/material/table';
import { ELEMENT_DATA, PeriodicElement } from './element-data.constant';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-periodic-table',
  imports: [
    MatTable,
    MatHeaderRow,
    MatHeaderRowDef,
    MatRow,
    MatRowDef,
    MatTextColumn,
    MatProgressSpinner,
  ],
  templateUrl: './periodic-table.component.html',
  styleUrl: './periodic-table.component.css',
})
export class PeriodicTableComponent implements OnInit {
  private destroyRef = inject(DestroyRef);

  protected isLoading = signal(true);
  protected readonly elementData = signal<PeriodicElement[]>([]);

  ngOnInit() {
    this.simulateFetch()
      .then((data) => {
        this.elementData.set(data);
      })
      .finally(() => {
        this.isLoading.set(false);
      });
  }

  private simulateFetch(): Promise<PeriodicElement[]> {
    const randomMs = Math.random() * 1000 + 500; // from 500 to 1500;
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        resolve(ELEMENT_DATA);
      }, randomMs);
      this.destroyRef.onDestroy(() => {
        clearTimeout(timeout);
        resolve([]);
      });
    });
  }

  protected posAccessor(data: PeriodicElement) {
    return `${data.position}`;
  }
  protected nameAccessor(data: PeriodicElement) {
    return data.name;
  }
  protected weightAccessor(data: PeriodicElement) {
    return `${data.weight}`;
  }
  protected symbolAccessor(data: PeriodicElement) {
    return data.symbol;
  }
}
