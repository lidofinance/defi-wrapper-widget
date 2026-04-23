# 0.4.3
- [stvStrategyPool] fix processable request being disabled on wrong condition
- [stvStrategyPool] fix strategy apy calculation 
- removed deprecated code for GGV strategy pool
- test and various code improvements

# 0.4.2
- correct user value calc for disconnected vault state
- display withdrawal requests for stvStrategyPool when below min withdrawal value

# 0.4.1

- update abi to fit mainnet deploy of lido earn strategy adapter
- fix APY fetching and display 

# 0.4.0

- Add functionality to claim distribution rewards for StvStrategyPool
- Fix withdrawal amount calculation for StvStrategyPool to account for disconnected vault state
- Show distribution rewards in vault status all pools
- Show icons for known tokens in vault details

# 0.3.0
- support new strategy type

# 0.2.1
- Fixed a bug for StvStethPool withdrawals where rebalance ration was calculated incorrectly
- Reworked min withdrawal value validation to be sync and be more optimized

# 0.2.0
Removed unused `useURLParams` and `truncateAddress` utilities

# 0.1.0
- Supported StvPool and StvStethPool
