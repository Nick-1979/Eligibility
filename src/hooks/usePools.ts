// Copyright 2019-2022 @polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { PoolInfo } from '../util/types';

import { useCallback, useEffect, useState } from 'react';

import { BN } from '@polkadot/util';

export default function usePools(): PoolInfo[] | null | undefined {
  const [pools, setPools] = useState<PoolInfo[] | undefined | null>();
  const [isFetching, setIsFetching] = useState<boolean>();
  const endpoint = 'wss://polkadot-rpc.dwellir.com: '; //'wss://polkadot.api.onfinality.io/public-ws: ';

  const getPools = useCallback((endpoint: string) => {
    const getPoolsWorker: Worker = new Worker(new URL('../util/workers/getPools.js', import.meta.url));

    getPoolsWorker.postMessage({ endpoint });

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

      // setNextPoolId(new BN(parsedPoolsInfo.nextPoolId));

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
    if (endpoint && getPools && !isFetching) {
      setIsFetching(true);
      getPools(endpoint);
    }
  }, [endpoint, getPools, isFetching]);

  return pools;
}
