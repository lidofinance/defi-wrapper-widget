export const CID_TO_GATEWAY: ((cid: string) => string)[] = [
  (cid) => `https://dweb.link/ipfs/${cid}`,
  (cid) => `https://ipfs.io/ipfs/${cid}`,
  (cid) => `https://gateway.pinata.cloud/ipfs/${cid}`,
];
