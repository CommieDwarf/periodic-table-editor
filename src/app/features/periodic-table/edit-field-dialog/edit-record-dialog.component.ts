import { Component, inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent, MatDialogRef,
  MatDialogTitle
} from '@angular/material/dialog';
import { MatButton } from '@angular/material/button';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { RowData } from '../periodic-table.component';


@Component({
  selector: 'app-edit-field-dialog',
  imports: [
    MatDialogTitle,
    MatDialogActions,
    MatButton,
    MatDialogClose,
    MatDialogContent,
    MatFormField,
    MatInput,
    MatLabel,
    ReactiveFormsModule,
    MatError
  ],
  templateUrl: './edit-record-dialog.component.html',
  styleUrl: './edit-record-dialog.component.css',
})
export class EditRecordDialogComponent {
  private readonly data: RowData = inject(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<EditRecordDialogComponent>);

  protected readonly validConfig = {
    name: {
      maxLength: 15,
    },
    weight: {
      min: 0.000000000001, // only positives
      maxLength: 13,
    },
    symbol: {
      maxLength: 3
    }
  } ;

  protected readonly formGroup = new FormGroup({
    name: new FormControl(this.data.name, [
      Validators.required,
      Validators.maxLength(this.validConfig.name.maxLength),
    ]),
    weight: new FormControl(this.data.weight, [
      Validators.required,
      Validators.min(this.validConfig.weight.min),
      Validators.pattern(/^\d*\.?\d+$/) // only numbers allowed
    ]),
    symbol: new FormControl(this.data.symbol, [
      Validators.required,
      Validators.maxLength(this.validConfig.symbol.maxLength),
    ]),
  });

  protected hasError(field: keyof typeof this.formGroup.controls, error: string): boolean {
    return this.formGroup.get(field)?.hasError(error) ?? false;
  }

  protected editElement() {
    if (this.formGroup.valid) {
      this.dialogRef.close({...this.formGroup.value, position: this.data.position});
    }
  }
}
