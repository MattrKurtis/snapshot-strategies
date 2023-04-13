import { BigNumberish } from '@ethersproject/bignumber';
import { formatUnits } from '@ethersproject/units';
import { Multicaller } from '../../utils';

export const author = 'MattrKurtis';
export const version = '0.1.0';

const abi = [
  'function balanceOf(address account) external view returns (uint256)'
];

export async function strategy(
  space: any,
  network: any,
  provider: any,
  addresses: string[],
  options: any,
  snapshot: number
): Promise<Record<string, number>> {
  const contractAddress = '0x6CB8065F96d63630425fd95A408A0D6cD697C662';
  const minimumBalance = 5000; // in EMBR, adjust as needed

  const blockTag = snapshot;

  const multi = new Multicaller(network, provider, abi, { blockTag });
  addresses.forEach((address) =>
    multi.call(address, contractAddress, 'balanceOf', [address])
  );
  const result: Record<string, BigNumberish> = await multi.execute();

  const votingPower: Record<string, number> = {};
  Object.entries(result).forEach(([address, balance]) => {
    const balanceInEmbr = parseFloat(formatUnits(balance, options.decimals));
    const hasMinimumBalance = balanceInEmbr >= minimumBalance;
    const votingPowerForAddress = hasMinimumBalance ? 1 : 0;
    votingPower[address] = votingPowerForAddress;
  });

  return votingPower;
}
