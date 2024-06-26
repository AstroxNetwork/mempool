import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { StateService } from '../../services/state.service';
import { Address, AddressTxSummary } from '../../interfaces/electrs.interface';
import { ElectrsApiService } from '../../services/electrs-api.service';
import { Observable, catchError, of } from 'rxjs';

@Component({
  selector: 'app-balance-widget',
  templateUrl: './balance-widget.component.html',
  styleUrls: ['./balance-widget.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BalanceWidgetComponent implements OnInit, OnChanges {
  @Input() address: string;
  @Input() addressInfo: Address;
  @Input() addressSummary$: Observable<AddressTxSummary[]> | null;
  @Input() isPubkey: boolean = false;

  isLoading: boolean = true;
  error: any;

  delta7d: number = 0;
  delta30d: number = 0;

  constructor(
    public stateService: StateService,
    private electrsApiService: ElectrsApiService,
    private cd: ChangeDetectorRef,
  ) { }

  ngOnInit(): void {
    
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.isLoading = true;
    if (!this.address || !this.addressInfo) {
      return;
    }
    (this.addressSummary$ || (this.isPubkey
      ? this.electrsApiService.getScriptHashSummary$((this.address.length === 66 ? '21' : '41') + this.address + 'ac')
      : this.electrsApiService.getAddressSummary$(this.address)).pipe(
      catchError(e => {
        this.error = `Failed to fetch address balance history: ${e?.status || ''} ${e?.statusText || 'unknown error'}`;
        return of(null);
      }),
    )).subscribe(addressSummary => {
      if (addressSummary) {
        this.error = null;
        this.calculateStats(addressSummary);
      }
      this.isLoading = false;
      this.cd.markForCheck();
    });
  }

  calculateStats(summary: AddressTxSummary[]): void {
    let weekTotal = 0;
    let monthTotal = 0;
    const weekAgo = (Date.now() / 1000) - (60 * 60 * 24 * 7);
    const monthAgo = (Date.now() / 1000) - (60 * 60 * 24 * 30);
    for (let i = 0; i < summary.length && summary[i].time >= monthAgo; i++) {
      monthTotal += summary[i].value;
      if (summary[i].time >= weekAgo) {
        weekTotal += summary[i].value;
      }
    }
    this.delta7d = weekTotal;
    this.delta30d = monthTotal;
  }
}
