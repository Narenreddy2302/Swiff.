export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Group {
  id: string;
  name: string;
  members: User[];
  createdAt: Date;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  paidBy: User;
  splitBetween: User[];
  groupId: string;
  date: Date;
  category?: string;
}

export interface Balance {
  from: User;
  to: User;
  amount: number;
}
