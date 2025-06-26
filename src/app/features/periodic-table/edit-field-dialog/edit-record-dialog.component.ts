import { Component, HostListener, inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { MatButton } from '@angular/material/button';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { PeriodicElement } from '../element-data.constant';

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
    MatError,
  ],
  templateUrl: './edit-record-dialog.component.html',
  styleUrl: './edit-record-dialog.component.css',
})
export class EditRecordDialogComponent {
  private readonly data: PeriodicElement = inject(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<EditRecordDialogComponent>);

  protected readonly VAL_CONFIG = {
    name: {
      maxLength: 15,
    },
    weight: {
      min: 0.00000000000001, // only positives
      maxLength: 13,
      pattern: /^\d*\.?\d+$/, // only number allowed
    },
    symbol: {
      maxLength: 3,
    },
  };

  protected readonly formGroup = new FormGroup({
    name: new FormControl(this.data.name, [
      Validators.required,
      Validators.maxLength(this.VAL_CONFIG.name.maxLength),
      this.noWhitespaceValidator,
    ]),
    weight: new FormControl(this.data.weight, [
      Validators.required,
      Validators.min(this.VAL_CONFIG.weight.min),
      Validators.pattern(this.VAL_CONFIG.weight.pattern), // only number allowed
    ]),
    symbol: new FormControl(this.data.symbol, [
      Validators.required,
      Validators.maxLength(this.VAL_CONFIG.symbol.maxLength),
      this.noWhitespaceValidator,
    ]),
  });

  @HostListener('keyup', ['$event'])
  protected onKeyUp(event: KeyboardEvent) {
    if (event.key === "Enter") {
      this.editElement();
    }
  }

  protected hasError(
    field: keyof typeof this.formGroup.controls,
    error: string,
  ): boolean {
    return this.formGroup.get(field)?.hasError(error) ?? false;
  }

  protected editElement(): void {
    if (this.formGroup.valid) {
      const values = this.formGroup.value;
      const element: PeriodicElement = {
        name: String(values.name).trim(),
        weight: Number(values.weight),
        symbol: String(values.symbol).trim(),
        position: this.data.position,
      };
      this.dialogRef.close(element);
    }
  }

  private noWhitespaceValidator(
    control: AbstractControl,
  ): ValidationErrors | null {
    return (control.value || '').trim().length > 0
      ? null
      : { whitespace: true };
  }
}
