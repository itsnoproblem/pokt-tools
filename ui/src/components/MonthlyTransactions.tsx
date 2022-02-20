import { useColorModeValue } from "@chakra-ui/react";
import React, { useMemo } from 'react';
import { useAsync } from 'react-use';

import { getPoktPrice } from "../MonitoringService";
import { useThrottleRequests } from '../hooks/useThrottleRequests';
import { Transaction } from "../types/transaction";
import { RewardTransaction } from "./RewardTransaction";

function timeout(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function useTransactions(transactions: Transaction[]) {
  const { throttle, updateThrottle } = useThrottleRequests<any>();

  useAsync(async () => {
    const requestsToMake = transactions.map((tx, index) => async () => {
      const txTime = new Date(tx.time);
      const firstDateWithPrice = new Date('2022-01-12T07:12:38');

      await timeout(1000);

      if (txTime >= firstDateWithPrice) {
        try {
          tx.poktPrice = await getPoktPrice(tx);

        } catch (error: any) {
          updateThrottle.requestFailedWithError(error);
        }
      }

      updateThrottle.requestSucceededWithData(tx);
    });

    await updateThrottle.queueRequests(requestsToMake);
  }, [updateThrottle]);

  return { throttle };
};

interface MonthlyTransactionsProps {
  transactions: Transaction[];
}

export const MonthlyTransactions = ({ transactions }: MonthlyTransactionsProps) => {
  const { throttle } = useTransactions(transactions);

  const bgOdd = useColorModeValue('gray.200', 'gray.800');
  const bgEven = useColorModeValue('gray.50', 'gray.700');

  const transactionWithPrice = useMemo(
    () =>
      throttle.values.sort(function (a: Transaction, b: Transaction) {
        return Number(new Date(b.time)) - Number(new Date(a.time));
      }),
    [throttle],
  );

  return (
    <React.Fragment>
      {transactionWithPrice.map((tx, j) => {
        const rowColor = j % 2 === 0 ? bgEven : bgOdd;

        return <RewardTransaction key={tx.hash} tx={tx} color={rowColor} />;
      })}
    </React.Fragment>
  );
};
