import { CommercialTransactionCreate } from '../commercial-transactions/CommercialTransactionCreate.js';

export function DebitCreate() {
  return <CommercialTransactionCreate resource="debits" />;
}
