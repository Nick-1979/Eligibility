// Copyright 2019-2022 @polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import usePools from './hooks/usePools';
import { Button, Checkbox, CircularProgress, FormControlLabel, Grid, TextField, Typography } from '@mui/material';
import TaskAltRoundedIcon from '@mui/icons-material/TaskAltRounded';
import { grey } from '@mui/material/colors';
import CheckBoxOutlineBlankRoundedIcon from '@mui/icons-material/CheckBoxOutlineBlankRounded';
import CheckBoxRoundedIcon from '@mui/icons-material/CheckBoxRounded';
import { PoolInfo } from './util/types';
import { saveAs } from 'file-saver';

const DEFAULT_FILTERS = {
  hasMetadata: false,
  hasNominees: false,
  isOpen: false,
  nominatesOthers: false,
  poolCreatorHasIdentity: false,
  hasMoreThanXMembers: {
    x: 0,
    check: false
  }
}

function App() {
  const pools = usePools();
  const [filters, setFilters] = React.useState(DEFAULT_FILTERS);
  const [memberLimit, setMemberLimit] = React.useState(10);
  const [filteredPools, setFilteredPools] = React.useState<PoolInfo[] | null | undefined>(pools);

  console.log('pools:', pools);
  console.log('memberLimit:', memberLimit);

  React.useEffect(() => {
    let filtered = filters.hasMetadata ? pools?.filter((pool) => pool.metadata) : pools;
    filtered = filters.poolCreatorHasIdentity ? filtered?.filter((pool) => !!pool.identity.judgements?.length) : filtered;
    filtered = filters.hasNominees ? filtered?.filter((pool) => pool.nominators?.targets?.length) : filtered;
    filtered = filters.isOpen ? filtered?.filter((pool) => pool.bondedPool.state) : filtered;
    filtered = filters.hasMoreThanXMembers.check ? filtered?.filter((pool) => pool.bondedPool.memberCounter > memberLimit) : filtered;

    filtered?.length && setFilteredPools(filtered?.length ? [...filtered] : []);
  }, [filters, memberLimit, pools]);

  const onFilters = React.useCallback((filter: keyof typeof DEFAULT_FILTERS) => {
    if (filter === 'hasMoreThanXMembers') {
      filters.hasMoreThanXMembers.check = !filters.hasMoreThanXMembers.check;

      return setFilters({ ...filters });
    }

    filters[filter] = !filters[filter];
    setFilters({ ...filters });
  }, [filters, setFilters]);

  const onExport = React.useCallback(() => {
    const ids = filteredPools?.map((p) => p.accounts.rewardId);

    var blob = new Blob([JSON.stringify(ids)], { type: "text/plain;charset=utf-8" });
    saveAs(blob, "rewardIds.txt");
  }, [filteredPools]);

  return (
    <Grid container justifyContent='center'>
      <Grid container item justifyContent='center' pt='30px'>
        <Typography variant='h5' sx={{ fontWeight: '500' }}>
          Polkadot Pools Filtering
        </Typography>
      </Grid>
      <Grid container item justifyContent='center' width='90%' sx={{ borderTop: '3px solid', borderTopColor: 'secondary.main' }}>
        <Grid container item justifyContent='center' pt='10px' pb='15px'>
          <FormControlLabel
            control={
              <Checkbox
                checked={filters.hasMetadata}
                checkedIcon={<CheckBoxRoundedIcon />}
                icon={<CheckBoxOutlineBlankRoundedIcon sx={{ color: 'secondary.light' }} />}
                onChange={() => onFilters('hasMetadata')}
                sx={{ p: 0 }}
              />
            }
            label={'Has Metadata'}
            sx={{ m: 'auto' }}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={filters.poolCreatorHasIdentity}
                checkedIcon={<CheckBoxRoundedIcon />}
                icon={<CheckBoxOutlineBlankRoundedIcon sx={{ color: 'secondary.light' }} />}
                onChange={() => onFilters('poolCreatorHasIdentity')}
                sx={{ p: 0 }}
              />
            }
            label={'Pool Creator has Verified Identity'}
            sx={{ m: 'auto' }}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={filters.hasNominees}
                checkedIcon={<CheckBoxRoundedIcon />}
                icon={<CheckBoxOutlineBlankRoundedIcon sx={{ color: 'secondary.light' }} />}
                onChange={() => onFilters('hasNominees')}
                sx={{ p: 0 }}
              />
            }
            label={'Has Nominees'}
            sx={{ m: 'auto' }}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={filters.isOpen}
                checkedIcon={<CheckBoxRoundedIcon />}
                icon={<CheckBoxOutlineBlankRoundedIcon sx={{ color: 'secondary.light' }} />}
                onChange={() => onFilters('isOpen')}
                sx={{ p: 0 }}
              />
            }
            label={'Is Open'}
            sx={{ m: 'auto' }}
          />
          <Grid item alignItems='center'>
            <FormControlLabel
              control={
                <Checkbox
                  checked={filters.hasMoreThanXMembers.check}
                  checkedIcon={<CheckBoxRoundedIcon />}
                  icon={<CheckBoxOutlineBlankRoundedIcon sx={{ color: 'secondary.light' }} />}
                  onChange={() => onFilters('hasMoreThanXMembers')}
                  sx={{ p: 0 }}
                />
              }
              label={'Members more than'}
              sx={{ mt: '9px' }}
            />
            <TextField
              size='small'
              sx={{ width: '70px' }}
              placeholder='10'
              type='number'
              onChange={(event) => setMemberLimit(Number(event.target.value))}
            />
          </Grid>
        </Grid>
        <Grid container item alignItems='center' justifyContent='flex-end' pb='15px'>
          <Grid item color='red' sx={{ mr: '20px', cursor: 'pointer', textDecoration: 'underline' }} onClick={() => setFilters(DEFAULT_FILTERS)}>
            Reset Filters
          </Grid>
          <Button
            variant="contained"
            onClick={onExport}
            disabled={!filteredPools?.length}
          >
            Export {filteredPools?.length ?? ''} Reward Ids
          </Button>
        </Grid>
        {!filteredPools
          ?
          <Grid container alignItems='center' justifyContent='center' pb='5px' mb='5px' sx={{ borderTop: '2px dashed', borderColor: 'secondary.main' }}>
            <Grid item pt='50px'>
              <CircularProgress size={50} />
            </Grid>
            <Grid item pt='50px'>
              <Typography sx={{ fontWeight: '300', fontSize: '12px' }}>
                Loading pools ...
              </Typography>
            </Grid>
          </Grid>
          : <Grid container item justifyContent='center'>
            <>
              <Grid container alignItems='center' pb='5px' mb='5px' sx={{ borderBottom: '2px dashed', borderTop: '2px dashed', borderColor: 'secondary.main' }}>
                <Grid item width='3%'>
                  Id
                </Grid>
                <Grid item width='50%' px='5px'>
                  Metadata
                </Grid>
                <Grid item width='20%'>
                  Depositor identity
                </Grid>
                <Grid item width='7%'>
                  #Members
                </Grid>
                <Grid item width='5%'>
                  State
                </Grid>
                <Grid item width='5%'>
                  #Validators
                </Grid>
              </Grid>
              {filteredPools.map((pool, index) => (
                <Grid container alignItems='center' key={index} pb='10px' sx={{ backgroundColor: index % 2 && grey[200] }}>
                  <Grid item width='3%'>
                    {Number(pool.poolId)}
                  </Grid>
                  <Grid item width='50%' px='5px'>
                    {pool.metadata}
                  </Grid>
                  <Grid item width='20%'>
                    {pool.identity.judgements?.length > 0 &&
                      <TaskAltRoundedIcon sx={{ backgroundColor: 'green', borderRadius: '50%', color: 'white', fontSize: '15px', mx: '3px' }} />
                    }
                    {pool.identity.display}
                    {pool.identity.displayParent &&
                      <>
                        /{pool.identity.displayParent}
                      </>
                    }
                  </Grid>
                  <Grid item width='7%'>
                    {pool.bondedPool.memberCounter}
                  </Grid>
                  <Grid item width='5%'>
                    {pool.bondedPool.state}
                  </Grid>
                  <Grid item width='5%'>
                    {pool.nominators?.targets?.length}
                  </Grid>
                </Grid>
              ))}
            </>
          </Grid>
        }
      </Grid>
    </Grid >
  );
}

export default App;
