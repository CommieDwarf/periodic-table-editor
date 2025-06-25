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
  MatTextColumn,
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

export interface RowData {
  position: string;
  name: string;
  symbol: string;
  weight: string;
}

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
  protected readonly tableData: Signal<RowData[]> = computed(() => {
    return this.isLoading()
      ? this.PLACEHOLDER_ROWS
      : this.store.filteredElements().map((element) => {
          return this.elementToRowData(element);
        });
  });

  protected readonly displayColumns = [
    'position',
    'name',
    'weight',
    'symbol',
    'edit',
  ];
  private readonly PLACEHOLDER_ROWS: RowData[] = Array(5).fill({
    position: '',
    name: '',
    weight: '',
    symbol: '',
  });

  protected filterControl = new FormControl<string>("");

  ngOnInit() {
    this.filterControl.valueChanges
      .pipe(debounceTime(2000))
      .subscribe((value) => {
        if (value !== null) {
          this.store.updateFilter(value);
        }
    })

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

  protected openEditDialog(data: RowData) {
    const dialogRef = this.dialog.open(EditRecordDialogComponent, {
      data,
    });
    const subscription = dialogRef
      .afterClosed()
      .pipe(take(1))
      .subscribe((data: RowData) => {
        this.store.updateElement(this.rowDataToElement(data));
      });
    this.destroyRef.onDestroy(() => subscription.unsubscribe());
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

  protected createAccessor(key: keyof PeriodicElement){
    return (data: PeriodicElement) => {
      return data[key].toString();
    }
  };

  private rowDataToElement(rowData: RowData): PeriodicElement {
    return {
      ...rowData,
      weight: Number(rowData.weight),
      position: Number(rowData.position)
    }
  }
  // Converting to string for easy placeholder display as empty strings.
  private elementToRowData(element: PeriodicElement): RowData {
    return {
      ...element,
      weight: element.weight.toString(),
      position: element.position.toString(),
    };
  }
}
