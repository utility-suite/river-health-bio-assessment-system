import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { familyData } from '../../../data-entries/family';

@Component({
  selector: 'app-homepage',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.scss']
})
export class HomepageComponent {
  familyInput: string = '';
  selectedGenera: string = '';
  generaOptions: string[] = [];

  entries: any[] = [];

  totals: { [key: string]: number } = {};
  averages: { [key: string]: number } = {};
  classes: { [key: string]: string } = {};

  onFamilyChange(): void {
    const family = this.familyInput.trim().toLowerCase();
    if (!family) {
      this.generaOptions = [];
      return;
    }

    const match = familyData.find(
      item => item.Family.toLowerCase() === family
    );

    if (match) {
      this.generaOptions = match.Genera_Species
        .split(',')
        .map(s => s.trim())
        .filter((v, i, a) => v && a.indexOf(v) === i);
    } else {
      this.generaOptions = [];
    }
  }

  searchFamily() {
    const family = this.familyInput.trim().toLowerCase();
    if (!family) return;

    const match = familyData.find(
      item => item.Family.toLowerCase() === family
    );

    if (match) {
      this.generaOptions = match.Genera_Species
        .split(',')
        .map(s => s.trim())
        .filter((v, i, a) => v && a.indexOf(v) === i);
    } else {
      this.generaOptions = [];
      alert('Family not found!');
    }
  }

  addEntry() {
    const family = this.familyInput.trim();
    const genera = this.selectedGenera.trim();

    if (!family) {
      alert('Please enter a Family name.');
      return;
    }

    const match = familyData.find(
      item => item.Family.toLowerCase() === family.toLowerCase()
    );

    if (!match) {
      alert('No matching family found!');
      return;
    }

    const speciesList = match.Genera_Species
      .split(',')
      .map(s => s.trim())
      .filter((v, i, a) => v && a.indexOf(v) === i);

    if (!genera) {
      // Add single entry with full Genera_Species string
      this.entries.push({
        Family: match.Family,
        Genera_Species: match.Genera_Species,
        GRSbios: match.GRSbios ?? '',
        HKHbios: match.HKHbios ?? '',
        BMWP: match.BMWP ?? '',
        BMWP_Thai: match['BMWP-Thai'] ?? '',
        SingScore: match.SingScore ?? '',
        BMWP_My: match['BMWP-My'] ?? ''
      });
    } else {
      if (!speciesList.includes(genera)) {
        alert(`Selected species "${genera}" not found under family "${match.Family}"`);
        return;
      }

      this.entries.push({
        Family: match.Family,
        Genera_Species: genera,
        GRSbios: match.GRSbios ?? '',
        HKHbios: match.HKHbios ?? '',
        BMWP: match.BMWP ?? '',
        BMWP_Thai: match['BMWP-Thai'] ?? '',
        SingScore: match.SingScore ?? '',
        BMWP_My: match['BMWP-My'] ?? ''
      });
    }

    this.calculateTotalsAndAverages();

    // Reset inputs
    this.familyInput = '';
    this.selectedGenera = '';
    this.generaOptions = [];
  }

  calculateTotalsAndAverages() {
    const fields = ['GRSbios', 'HKHbios', 'BMWP', 'BMWP_Thai', 'SingScore', 'BMWP_My'];
    this.totals = {};
    this.averages = {};
    this.classes = {};

    fields.forEach(field => {
      const values = this.entries
        .map(entry => entry[field])
        .filter(val => val !== '' && val !== null && !isNaN(val))
        .map(Number);

      const sum = values.reduce((acc, val) => acc + val, 0);
      const avg = values.length > 0 ? parseFloat((sum / values.length).toFixed(2)) : 0;

      this.totals[field] = sum;
      this.averages[field] = avg;
      this.classes[field] = this.getClass(avg);
    });
  }

  getClass(avg: number): string {
    if (avg >= 7) return 'A';
    if (avg >= 6) return 'B';
    if (avg >= 5) return 'C';
    if (avg >= 2) return 'D';
    return 'E';
  }

}
