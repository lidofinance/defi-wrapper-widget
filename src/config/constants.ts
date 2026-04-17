import { parseEther } from 'viem';

// Threshold after which minting is considered sustainable enough for user prompt
export const SUSTAINABLE_MINT_STETH_THRESHOLD = parseEther('0.001');

// Threshold after which processable withdrawal requests are considered significant enough to display to the user
// They might not proccessable if it's below the minimum withdrawal amount, but it's important to show them so that user values add up
export const PROCESSABLE_ETH_DISPLAY_THRESHOLD = 10n;
