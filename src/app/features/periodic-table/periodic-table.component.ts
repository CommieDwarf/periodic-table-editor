import {
  Component,
  DestroyRef,
  OnInit,
  signal,
  inject,
  computed,
  Signal,
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
    ReactiveFormsModule
  ],
  providers: [ElementDataStore],
  templateUrl: './periodic-table.component.html',
  styleUrl: './periodic-table.component.css',
})
export class PeriodicTableComponent implements OnInit {
  private destroyRef = inject(DestroyRef);
  private dialog = inject(MatDialog);
  readonly store = inject(ElementDataStore);

  protected isLoading = signal(true);

  protected readonly tableData: Signal<PeriodicElement[]> = computed(() => {
    return this.isLoading()
      ? this.PLACEHOLDER_ROWS
      : this.store.filteredElements();
  });

  protected readonly displayColumns = [
    'position',
    'name',
    'weight',
    'symbol',
    'edit',
  ];
  private readonly PLACEHOLDER_ROWS: PeriodicElement[] = Array(5).fill({
    position: 0,
    name: '',
    weight: 0,
    symbol: '',
  });

  protected filterControl = new FormControl<string>("");

  ngOnInit() {
    this.subscribeToFilter();
    this.fetchElements();
  }

  protected openEditDialog(data: PeriodicElement) {
    const dialogRef = this.dialog.open(EditRecordDialogComponent, {
      data,
    });
    const subscription = dialogRef
      .afterClosed()
      .pipe(take(1))
      .subscribe((data: PeriodicElement) => {
        this.store.updateElement(data);
      });
    this.destroyRef.onDestroy(() => subscription.unsubscribe());
  }

  private subscribeToFilter() {
    this.filterControl.valueChanges
      .pipe(debounceTime(2000), takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => {
        if (value !== null) {
          this.store.updateFilter(value);
        }
      })
  }

  private fetchElements() {
    this.simulateFetch()
      .then((data) => {
        this.store.updateElements(data);
      })
      .catch((error) => {
        // TODO: implement
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
}
