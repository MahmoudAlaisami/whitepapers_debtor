export type DebtorGender = 'male' | 'female';
export type DebtorStatus = 'active' | 'blocked';

export interface Debtor {
  _id: string;
  username: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  birthDate?: string;
  gender?: DebtorGender;
  address?: string;
  status?: DebtorStatus;
  createdAt?: string;
  updatedAt?: string;
  loggedInAt?: string;
}

export interface CreditorSummary {
  _id: string;
  businessName?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
}

export interface Transaction {
  _id: string;
  local_id?: string;
  type: string;
  value: number;
  currency: string;
  text: string;
  description?: string;
  createdAt?: string;
}

export interface ActivePaper {
  _id: string;
  creditor: CreditorSummary;
  transactions: Transaction[];
}

export interface DebtorProfileUpdate {
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  birthDate?: string | null;
  gender?: DebtorGender;
  address?: string;
}
