import { useEffect, useMemo } from 'react';
import {
  FieldValues,
  FormProvider,
  UseFormReset,
  UseFormReturn,
} from 'react-hook-form';
import { useDappStatus } from '@/modules/web3';
import type { EventSubscription } from './event-subscription';
import { useWagmiConnectionChangedCallback } from './use-wagmi-connection-changed-callback';

type FormControllerProps<
  TFieldValues extends FieldValues = FieldValues,
  TContext = any,
  TTransformedValues = TFieldValues,
> = {
  formObject: UseFormReturn<TFieldValues, TContext, TTransformedValues>;
  onSubmit: (values: TTransformedValues) => Promise<boolean>;
  retryEvent?: EventSubscription;
  afterSubmitResetOptions?: Parameters<UseFormReset<any>>[1] | false;
} & Omit<React.ComponentProps<'form'>, 'onSubmit'>;

export const FormController = <
  TFieldValues extends FieldValues = FieldValues,
  TContext = any,
  TTransformedValues = TFieldValues,
>({
  children,
  onSubmit,
  retryEvent,
  formObject,
  afterSubmitResetOptions,
  ...props
}: FormControllerProps<TFieldValues, TContext, TTransformedValues>) => {
  const { isDappActive } = useDappStatus();
  const { handleSubmit, reset: resetDefault } = formObject;

  const shouldReset =
    typeof afterSubmitResetOptions == 'boolean'
      ? afterSubmitResetOptions
      : true;

  // Bind submit action
  const doSubmit = useMemo(() => {
    return handleSubmit(async (args) => {
      const success = await onSubmit(args);
      if (success && shouldReset)
        resetDefault(undefined, afterSubmitResetOptions || undefined);
    });
  }, [
    afterSubmitResetOptions,
    handleSubmit,
    onSubmit,
    resetDefault,
    shouldReset,
  ]);

  // Bind retry callback
  useEffect(() => {
    return retryEvent?.subscribe(doSubmit);
  }, [retryEvent, doSubmit]);

  // Reset form amount after disconnect wallet
  useEffect(() => {
    if (!isDappActive) resetDefault();
    // reset will be captured when active changes
    // so we don't need it in deps
  }, [isDappActive, resetDefault]);

  // Reset the form when chain id or wallet address changed
  useWagmiConnectionChangedCallback(resetDefault);

  return (
    <FormProvider {...formObject}>
      <form
        autoComplete="off"
        onSubmit={doSubmit}
        style={{ width: '100%' }}
        {...props}
      >
        {children}
      </form>
    </FormProvider>
  );
};
