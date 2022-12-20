// Copyright 2019-2022 @polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { Button, InputAdornment, TextField } from '@mui/material';
import { saveAs } from 'file-saver';
import { BN } from '@polkadot/util';

import { COUNCIL_ADDRESS } from './consts';
import { ApiPromise } from '@polkadot/api';

interface Props {
  api: ApiPromise | undefined
  rewardIds: string[] | undefined;
}

function ExportCalls({ api, rewardIds }: Props): React.ReactElement<Props> {
  const [rewardAmountInDOT, setRewardAmountInDot] = React.useState(500);
  const onExport = React.useCallback(() => {
    if (!api || !rewardIds?.length) {
      return;
    }

    const decimal = api.registry.chainDecimals[0]
    const reward = new BN(rewardAmountInDOT * 10 ** decimal);

    let call = api.tx.utility.batch(
      rewardIds.map((a) => api.tx.balances.forceTransfer(COUNCIL_ADDRESS, a, reward))
    );
    // call encoded
    console.log(call.toU8a());

    var blob = new Blob([String(call.toHex())], { type: "text/plain;charset=utf-8" });
    saveAs(blob, "calls.txt");
  }, [api, rewardAmountInDOT, rewardIds]);

  return (
    <>
      <TextField
        size='small'
        sx={{ width: '130px', mr: '20px' }}
        placeholder={String(rewardAmountInDOT)}
        type='number'
        label='Reward'
        margin='dense'
        InputLabelProps={{ shrink: true }}
        InputProps={{
          endAdornment: <InputAdornment position="end">DOT</InputAdornment>,
        }}
        onChange={(event) => setRewardAmountInDot(Number(event.target.value))}
      />

      <Button
        variant="outlined"
        color='secondary'
        onClick={onExport}
        disabled={!rewardIds?.length}
        sx={{ textTransform: 'none', py:'7px' }}
      >
        Export {rewardIds?.length ?? ''} calls
      </Button>
    </>
  );
}

export default ExportCalls;
