// to suuport import of internal lib files

declare module 'viem/_types/*' {
  export type any = any;
  const _default: any;
  export default _default;
}

declare module 'ox/_types/*' {
  export type any = any;
  const _default: any;
  export default _default;
}

declare module '@wagmi/core/dist/types/*' {
  export type any = any;
  const _default: any;
  export default _default;
}
