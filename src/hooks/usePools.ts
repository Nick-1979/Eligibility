// Copyright 2019-2022 @polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { PoolInfo } from '../util/types';

import { useCallback, useEffect, useState } from 'react';

import { BN } from '@polkadot/util';

export default function usePools(endpoint: string, blockToFetchAt: BN | undefined, isLoading: boolean, setIsLoading: React.Dispatch<React.SetStateAction<boolean>>): PoolInfo[] | null | undefined {
  const [pools, setPools] = useState<PoolInfo[] | undefined | null>();

  const getPools = useCallback((endpoint: string, blockToFetchAt: BN) => {
    const getPoolsWorker: Worker = new Worker(new URL('../util/workers/getPools.js', import.meta.url));
    const block = String(blockToFetchAt);
    getPoolsWorker.postMessage({ endpoint, block });

    getPoolsWorker.onerror = (err) => {
      console.log(err);
    };

    getPoolsWorker.onmessage = (e: MessageEvent<any>) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const poolsInfo: string = e.data;

      if (!poolsInfo) {
        setPools(null);// noo pools found, probably never happens

        return;
      }

      const parsedPoolsInfo = JSON.parse(poolsInfo);
      const info = parsedPoolsInfo.info as PoolInfo[];

      info?.forEach((p: PoolInfo) => {
        if (p?.bondedPool?.points) {
          p.bondedPool.points = new BN(String(p.bondedPool.points));
        }

        p.poolId = new BN(p.poolId);
      });

      setPools(info);

      getPoolsWorker.terminate();
    };
  }, []);

  useEffect(() => {
    if (endpoint && getPools && isLoading && blockToFetchAt) {
      getPools(endpoint, blockToFetchAt);
      setIsLoading(false);
    }
  }, [blockToFetchAt, endpoint, getPools, isLoading, setIsLoading]);

  return pools;
}
