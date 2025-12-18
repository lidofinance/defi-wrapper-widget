import { createContext, PropsWithChildren, useMemo } from 'react';
import { USER_CONFIG, UserConfigDefaultType } from '@/config/user-config';

type ConfigProviderType = { userConfig: UserConfigDefaultType };

export const ConfigContext = createContext<ConfigProviderType | null>(null);

export const ConfigProvider = ({ children }: PropsWithChildren<{}>) => {
  const contextValue = useMemo(
    () => ({
      userConfig: {
        ...USER_CONFIG,
      },
    }),
    [],
  );

  return (
    <ConfigContext.Provider value={contextValue}>
      {children}
    </ConfigContext.Provider>
  );
};
