import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BisqTransaction, BisqBlock, BisqStats } from './bisq.interfaces';

const API_BASE_URL = '/bisq/api';

@Injectable({
  providedIn: 'root'
})
export class BisqApiService {
  apiBaseUrl: string;

  constructor(
    private httpClient: HttpClient,
  ) { }

  getStats$(): Observable<BisqStats> {
    return this.httpClient.get<BisqStats>(API_BASE_URL + '/stats');
  }

  getTransaction$(txId: string): Observable<BisqTransaction> {
    return this.httpClient.get<BisqTransaction>(API_BASE_URL + '/tx/' + txId);
  }

  listTransactions$(start: number, length: number, types: string[]): Observable<HttpResponse<BisqTransaction[]>> {
    let params = new HttpParams();
    types.forEach((t: string) => {
      params = params.append('types[]', t);
    });
    return this.httpClient.get<BisqTransaction[]>(API_BASE_URL + `/txs/${start}/${length}`, { params, observe: 'response' });
  }

  getBlock$(hash: string): Observable<BisqBlock> {
    return this.httpClient.get<BisqBlock>(API_BASE_URL + '/block/' + hash);
  }

  listBlocks$(start: number, length: number): Observable<HttpResponse<BisqBlock[]>> {
    return this.httpClient.get<BisqBlock[]>(API_BASE_URL + `/blocks/${start}/${length}`, { observe: 'response' });
  }

  getAddress$(address: string): Observable<BisqTransaction[]> {
    return this.httpClient.get<BisqTransaction[]>(API_BASE_URL + '/address/' + address);
  }

  getMarkets$(): Observable<any[]> {
    return this.httpClient.get<any[]>(API_BASE_URL + '/markets/markets');
  }

  getMarketsTicker$(): Observable<any[]> {
    return this.httpClient.get<any[]>(API_BASE_URL + '/markets/ticker');
  }

  getMarketsCurrencies$(): Observable<any[]> {
    return this.httpClient.get<any[]>(API_BASE_URL + '/markets/currencies');
  }

  getMarketsHloc$(market: string, interval: 'minute' | 'half_hour' | 'hour' | 'half_day' | 'day'
  | 'week' | 'month' | 'year' | 'auto'): Observable<any[]> {
    return this.httpClient.get<any[]>(API_BASE_URL + '/markets/hloc?market=' + market + '&interval=' + interval);
  }

  getMarket24hVolumes$(): Observable<any[]> {
    return this.httpClient.get<any[]>(API_BASE_URL + '/markets/24hvolumes');
  }
}
