declare module '*.module.css' {
  /**
   * Type definition for CSS modules
   * This provides proper type checking and IntelliSense for CSS class names
   *
   * Example usage:
   * import styles from './component.module.css';
   * <div className={styles.myClass}></div>
   */
  const classes: { [key: string]: string };
  export default classes;
}
