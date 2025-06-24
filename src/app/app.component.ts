import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {PeriodicTableComponent} from './features/periodic-table/periodic-table.component';

@Component({
  selector: 'app-root',
  imports: [
    PeriodicTableComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'periodic-table-editor';
}
