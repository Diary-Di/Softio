// hooks/useSaleCustomers.ts
import { useEffect, useState } from 'react';
import { customerService, Customer } from '../services/customerService';
import { Sale } from '../services/salesService';

export const useSaleCustomers = (sales: Sale[]) => {
  const [map, setMap] = useState<Record<number, Customer>>({});

  useEffect(() => {
    const ids = [...new Set(sales.map(s => s.client_id).filter(Boolean))] as number[];
    if (!ids.length) return;

    Promise.all(ids.map(id => customerService.getCustomerById(id)))
      .then(customers =>
        setMap(
          customers.reduce((acc, c) => {
            acc[c.identifiant] = c;
            return acc;
          }, {} as Record<number, Customer>)
        )
      )
      .catch(() => {}); // silencieux ou log
  }, [sales]);

  return map; // { [client_id]: Customer }
};