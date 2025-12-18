declare module '*.svg' {
  /**
   * Default SVG import as a URL string
   */
  const content: string;
  export default content;
}

declare module '*.svg?react' {
  /**
   * SVG imported as a React component using Vite's ?react suffix
   * This allows you to use SVGs as React components
   *
   * Example usage:
   * import MyIcon from './icon.svg?react';
   * <MyIcon width={24} height={24} />
   */
  import { FC, SVGProps } from 'react';
  const ReactComponent: FC<SVGProps<SVGSVGElement>>;
  export default ReactComponent;
}

declare module '*.svg?url' {
  /**
   * SVG imported as a URL string using Vite's ?url suffix
   */
  const content: string;
  export default content;
}
