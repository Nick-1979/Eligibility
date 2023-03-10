// Copyright 2019-2022 @polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import getApi from '../getApi.ts';
import getPoolAccounts from '../getPoolAccounts.ts';

async function getPools(endpoint, block) {
  console.log(`getPools worker is called to fetch pools at block ${block}`);
  const api = await getApi(endpoint);
  const hash=await api.rpc.chain.getBlockHash(block);

  const apiAt = await api.at(hash);

  const lastPoolId = await apiAt.query.nominationPools.lastPoolId();

  console.log(`getting pools info of ${lastPoolId.toNumber()} pools`);

  if (!lastPoolId) {
    return null;
  }

  const queries = [];

  for (let poolId = 1; poolId <= lastPoolId.toNumber(); poolId++) {
    queries.push(Promise.all([
      apiAt.query.nominationPools.metadata(poolId),
      apiAt.query.nominationPools.bondedPools(poolId),
      apiAt.query.nominationPools.rewardPools(poolId)
    ]));
  }

  const info = await Promise.all(queries);

  const poolsInfo = info.map((i, index) => {
    if (i[1].isSome) {
      const bondedPool = i[1].unwrap();

      return {
        bondedPool: { memberCounter: String(bondedPool.memberCounter), points: String(bondedPool.points), roles: bondedPool.roles, state: bondedPool.state },
        metadata: i[0]?.length
          ? i[0]?.isUtf8
            ? i[0]?.toUtf8()
            : i[0]?.toString()
          : null,
        poolId: index + 1, // works because pools id is not reuseable for now
        rewardPool: i[2]?.isSome ? i[2].unwrap() : null,
        accounts: getPoolAccounts(api, index + 1)
      };
    } else {
      return undefined;
    }
  })?.filter((f) => f !== undefined);


  console.log('getting pools owners identities...');
  const identities = await Promise.all(poolsInfo.map((pool) => api.derive.accounts.info(pool.bondedPool.roles?.root || pool.bondedPool.roles.depositor)))
  console.log(`${identities?.length} identities fetched`);

  poolsInfo.forEach((pool, index) => {
    pool.identity = identities[index].identity;
  });

  console.log('getting pools nominators ...');
  const nominators = await Promise.all(poolsInfo.map((pool) => apiAt.query.staking.nominators(pool.accounts.stashId)))
  console.log(`${nominators?.length} nominators fetched`);

  poolsInfo.forEach((pool, index) => {
    pool.nominators = nominators[index];
  });


  return JSON.stringify({ info: poolsInfo, nextPoolId: lastPoolId.addn(1).toString() });
}

onmessage = (e) => {
  const { endpoint, block } = e.data;

  // eslint-disable-next-line no-void
  void getPools(endpoint, block).then((poolsInfo) => {
    postMessage(poolsInfo);
  });
};
