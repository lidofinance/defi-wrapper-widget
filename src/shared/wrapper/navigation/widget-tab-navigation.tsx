import { Tabs, TabsRootProps } from '@chakra-ui/react';

export type WidgetState = 'deposit' | 'withdraw' | 'dashboard';

export const WidgetTabNavigation = ({
  mode,
  tabs,
  onTabClick,
  ...rest
}: {
  mode: WidgetState;
  tabs: { value: WidgetState; label: string }[];
  onTabClick: (value: WidgetState) => void;
} & TabsRootProps) => {
  return (
    <Tabs.Root
      value={mode}
      onValueChange={(e: { value: string }) => {
        onTabClick(e.value as WidgetState);
      }}
      variant="enclosed"
      maxW="md"
      size="lg"
      fitted
      {...rest}
    >
      <Tabs.List bg="bg.muted">
        {tabs.map((tab) => (
          <Tabs.Trigger value={tab.value} key={tab.value}>
            {tab.label}
          </Tabs.Trigger>
        ))}
      </Tabs.List>
    </Tabs.Root>
  );
};
