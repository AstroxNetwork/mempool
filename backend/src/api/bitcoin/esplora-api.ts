const config = require('../../../mempool-config.json');
import { ITransaction, IMempoolInfo, IBlock } from '../../interfaces';
import { AbstractBitcoinApi } from './bitcoin-api-abstract-factory';
import axios, { AxiosResponse } from 'axios';

class EsploraApi implements AbstractBitcoinApi {
  client: any;

  constructor() {
    this.client = axios.create({
      baseURL: config.ESPLORA_API_URL,
      timeout: 15000,
    });
  }

  getMempoolInfo(): Promise<IMempoolInfo> {
    return new Promise(async (resolve, reject) => {
      try {
        const response: AxiosResponse = await this.client.get('/mempool');
        resolve({
          size: response.data.count,
          bytes: response.data.vsize,
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  getRawMempool(): Promise<ITransaction['txid'][]> {
    return new Promise(async (resolve, reject) => {
      try {
        const response: AxiosResponse = await this.client.get('/mempool/txids');
        resolve(response.data);
      } catch (error) {
        reject(error);
      }
    });
  }

  getRawTransaction(txId: string): Promise<ITransaction> {
    return new Promise(async (resolve, reject) => {
      try {
        const response: AxiosResponse = await this.client.get('/tx/' + txId);

        response.data.vsize = Math.round(response.data.weight / 4);
        response.data.fee = response.data.fee / 100000000;
        response.data.blockhash = response.data.status.block_hash;

        resolve(response.data);
      } catch (error) {
        reject(error);
      }
    });
  }

  getBlockCount(): Promise<number> {
    return new Promise(async (resolve, reject) => {
      try {
        const response: AxiosResponse = await this.client.get('/blocks/tip/height');
        resolve(response.data);
      } catch (error) {
        reject(error);
      }
    });
  }

  getBlockAndTransactions(hash: string): Promise<IBlock> {
    return new Promise(async (resolve, reject) => {
      try {
        const blockInfo: AxiosResponse = await this.client.get('/block/' + hash);
        const blockTxs: AxiosResponse = await this.client.get('/block/' + hash + '/txids');

        const block = blockInfo.data;
        block.hash = hash;
        block.nTx = block.tx_count;
        block.time = block.timestamp;
        block.tx = blockTxs.data;

        resolve(block);
      } catch (error) {
        reject(error);
      }
    });
  }

  getBlockHash(height: number): Promise<string> {
    return new Promise(async (resolve, reject) => {
      try {
        const response: AxiosResponse = await this.client.get('/block-height/' + height);
        resolve(response.data);
      } catch (error) {
        reject(error);
      }
    });
  }

  getBlocks(): Promise<string> {
    return new Promise(async (resolve, reject) => {
      try {
        const response: AxiosResponse = await this.client.get('/blocks');
        resolve(response.data);
      } catch (error) {
        reject(error);
      }
    });
  }

  getBlocksFromHeight(height: number): Promise<string> {
    return new Promise(async (resolve, reject) => {
      try {
        const response: AxiosResponse = await this.client.get('/blocks/' + height);
        resolve(response.data);
      } catch (error) {
        reject(error);
      }
    });
  }

  getBlock(hash: string): Promise<IBlock> {
    return new Promise(async (resolve, reject) => {
      try {
        const blockInfo: AxiosResponse = await this.client.get('/block/' + hash);
        resolve(blockInfo.data);
      } catch (error) {
        reject(error);
      }
    });
  }

  getBlockTransactions(hash: string): Promise<IBlock> {
    return new Promise(async (resolve, reject) => {
      try {
        const blockInfo: AxiosResponse = await this.client.get('/block/' + hash + '/txs');
        resolve(blockInfo.data);
      } catch (error) {
        reject(error);
      }
    });
  }

  getBlockTransactionsFromIndex(hash: string, index: number): Promise<IBlock> {
    return new Promise(async (resolve, reject) => {
      try {
        const blockInfo: AxiosResponse = await this.client.get('/block/' + hash + '/txs/' + index);
        resolve(blockInfo.data);
      } catch (error) {
        reject(error);
      }
    });
  }
}

export default EsploraApi;
