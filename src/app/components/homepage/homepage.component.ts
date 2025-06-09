import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { familyData } from '../../../data-entries/family';
import { ExportAsPdfComponent } from '../export-as-pdf/export-as-pdf.component';

@Component({
  selector: 'app-homepage',
  standalone: true,
  imports: [CommonModule, FormsModule, ExportAsPdfComponent],
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.scss']
})
export class HomepageComponent {
  familyInput: string = '';
  familySuggestions: string[] = [];
  entries: any[] = [];
  totals: { [key: string]: number | null } = {};
  averages: { [key: string]: number | null } = {};
  classes: { [key: string]: string | null } = {};
  scoreTypes = ['HKHbios', 'BMWP', 'GRSbios', 'BMWP_Thai', 'SingScore', 'BMWP_My'];
  stationName = '';
  latitude = '';
  longitude = '';
  sampleDate = '';
  sampleTime = '';

  onFamilyInputChange(): void {
    const input = this.familyInput.trim().toLowerCase();
    if (!input) {
      this.familySuggestions = [];
      return;
    }

    const allFamilies = new Set<string>();
    for (let type of this.scoreTypes) {
      for (let entry of familyData[type]) {
        allFamilies.add(entry.Family);
      }
    }

    this.familySuggestions = Array.from(allFamilies).filter(fam =>
      fam.toLowerCase().startsWith(input)
    );
  }

  addEntry(): void {
    const family = this.familyInput.trim();
    if (!family) return;

    // Check if family exists in at least one score group
    const presentInAtLeastOne = this.scoreTypes.some(
      type => familyData[type].some(entry => entry.Family.toLowerCase() === family.toLowerCase())
    );

    if (!presentInAtLeastOne) {
      alert('Family not found in the dataset.');
      return;
    }

    // Check for duplicate
    if (this.entries.some(e => e.Family.toLowerCase() === family.toLowerCase())) {
      alert('Family already added.');
      return;
    }

    const entry: any = { Family: family };

    for (let type of this.scoreTypes) {
      const match = familyData[type].find(e => e.Family.toLowerCase() === family.toLowerCase());
      entry[type] = match ? match.Score : '';
    }

    this.entries.push(entry);
    this.calculateTotalsAndAverages();
    this.familyInput = '';
    this.familySuggestions = [];
  }

  calculateTotalsAndAverages() {
    this.totals = {};
    this.averages = {};
    this.classes = {};

    for (let type of this.scoreTypes) {
      const values = this.entries
        .map(e => e[type])
        .filter(v => v !== '' && v !== null && !isNaN(v))
        .map(Number);

      if (values.length === 0) {
        // No values, assign null for display as NA
        this.totals[type] = null;
        this.averages[type] = null;
        this.classes[type] = null;
        continue;
      }

      const sum = values.reduce((acc, v) => acc + v, 0);
      const avg = parseFloat((sum / values.length).toFixed(2));

      this.totals[type] = sum;
      this.averages[type] = avg;
      this.classes[type] = this.getClass(avg);
    }
  }

  getClass(avg: number): string {
    if (avg >= 7) return 'A';
    if (avg >= 6) return 'B';
    if (avg >= 5) return 'C';
    if (avg >= 2) return 'D';
    return 'E';
  }

  getClassColorClass(classLabel: string | null, type: string): string {
    if (classLabel === null) {
      return 'bg-secondary text-dark'; // For NA class
    }
    switch (classLabel) {
      case 'A': return 'bg-primary text-dark';      // Blue
      case 'B': return 'bg-info text-dark';         // SkyBlue
      case 'C': return 'bg-success text-dark';      // Green
      case 'D': return 'bg-warning text-dark';      // Yellow
      case 'E': return 'bg-danger text-dark';       // Red
      default: return 'text-dark';
    }
  }

  resetTable(): void {
    this.entries = [];
    this.totals = {};
    this.averages = {};
    this.classes = {};
  }

  // Helper method to check if there are any valid numeric values for a scoreType
  hasValues(type: string): boolean {
    return this.entries.some(e => e[type] !== '' && e[type] !== null && !isNaN(e[type]));
  }
}
