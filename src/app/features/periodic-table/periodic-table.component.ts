import {
  Component,
  DestroyRef,
  OnInit,
  signal,
  inject,
  computed,
  Signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow,
  MatRowDef,
  MatTable,
} from '@angular/material/table';
import { ELEMENT_DATA, PeriodicElement } from './element-data.constant';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';
import { EditRecordDialogComponent } from './edit-field-dialog/edit-record-dialog.component';
import { MatButton } from '@angular/material/button';
import { debounceTime, take } from 'rxjs';
import { ElementDataStore } from './element-data.store';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-periodic-table',
  imports: [
    MatTable,
    MatHeaderRow,
    MatHeaderRowDef,
    MatRow,
    MatRowDef,
    MatProgressSpinner,
    MatColumnDef,
    MatHeaderCellDef,
    MatCellDef,
    MatCell,
    MatHeaderCell,
    MatButton,
    MatFormField,
    MatLabel,
    MatInput,
    ReactiveFormsModule,
  ],
  providers: [ElementDataStore],
  templateUrl: './periodic-table.component.html',
  styleUrl: './periodic-table.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PeriodicTableComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly dialog = inject(MatDialog);
  private readonly store = inject(ElementDataStore);

  protected isLoading = signal(true);
  protected error = signal('');

  protected readonly tableData: Signal<PeriodicElement[]> = computed(() => {
    return this.isLoading()
      ? this.PLACEHOLDER_ROWS
      : this.store.filteredElements();
  });

  protected readonly filterControl = new FormControl<string>('');

  private readonly PLACEHOLDER_ROWS: PeriodicElement[] = Array(5).fill({
    position: 0,
    name: '',
    weight: 0,
    symbol: '',
  });
  protected readonly DISPLAYED_COLUMNS = [
    'position',
    'name',
    'weight',
    'symbol',
    'edit',
  ];

  ngOnInit() {
    this.subscribeToFilter();
    this.fetchElements();
  }

  protected openEditDialog(data: PeriodicElement): void {
    const isMobile = window.innerWidth <= 768;
    const dialogRef = this.dialog.open(EditRecordDialogComponent, {
      data,
      position: isMobile ? { top: '10px' } : undefined, // Keyboard obscured the dialog.
    });
    dialogRef
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef), take(1))
      .subscribe((data: PeriodicElement) => {
        this.store.updateElement(data);
      });
  }

  protected fetchElements(): void {
    this.isLoading.set(true);
    this.error.set('');
    this.simulateFetch()
      .then((data) => {
        this.store.updateElements(data);
      })
      .catch((error) => {
        this.error.set('Something went wrong while loading the data.');
        console.error(error);
      })
      .finally(() => {
        this.isLoading.set(false);
      });
  }

  private subscribeToFilter(): void {
    this.filterControl.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef), debounceTime(2000)) // 2s
      .subscribe((value) => {
        if (value !== null) {
          this.store.updateFilter(value.trim());
        }
      });
  }

  private simulateFetch(): Promise<PeriodicElement[]> {
    const randomMs = Math.random() * 1000 + 500; // from 500 to 1500;
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        // uncomment to simulate error
        // reject(new Error('Epic fail'));
        resolve(ELEMENT_DATA);
      }, randomMs);
      this.destroyRef.onDestroy(() => {
        clearTimeout(timeout);
        resolve([]);
      });
    });
  }
}
