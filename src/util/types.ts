
// Copyright 2019-2022 @polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

// import type { PalletNominationPoolsBondedPoolInner, PalletNominationPoolsRewardPool } from '@polkadot/types/lookup';

import type { BN } from '@polkadot/util';

export interface PoolInfo {
  poolId: BN;
  identity: any;
  bondedPool: any;//PalletNominationPoolsBondedPoolInner | null;
  metadata: string | null;
  rewardPool: any;//PalletNominationPoolsRewardPool | null
  nominators: any;
  accounts: PoolAccounts;
}

export interface PoolAccounts {
  rewardId: string;
  stashId: string;
}