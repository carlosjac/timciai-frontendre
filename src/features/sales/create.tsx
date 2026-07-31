import { CommercialTransactionCreate } from '../commercial-transactions/CommercialTransactionCreate.js';

export function SaleCreate() {
  return <CommercialTransactionCreate resource="sales" />;
}
