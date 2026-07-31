import { CommercialTransactionCreate } from '../commercial-transactions/CommercialTransactionCreate.js';

export function CreditCreate() {
  return <CommercialTransactionCreate resource="credits" />;
}
