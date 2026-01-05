export enum Role {
  ADMIN = 'ADMIN',
  HR = 'HR',
  LANH_DAO_TRUONG_PHONG = 'LANH_DAO_TRUONG_PHONG',
  KE_TOAN_LUONG = 'KE_TOAN_LUONG',
  EMPLOYEE = 'EMPLOYEE'
}

export enum EmployeeType {
  BIEN_CHE = 'BIEN_CHE',
  HOP_DONG = 'HOP_DONG'
}

export const AttendanceStatus = {
  PRESENT: 'PRESENT',
  ABSENT: 'ABSENT',
  LEAVE: 'LEAVE'
} as const;

export const ErrorMessages = {
  UNAUTHORIZED: 'Unauthorized',
  FORBIDDEN: 'Forbidden',
  NOT_FOUND: 'Not found'
};

export type PaginationQuery = {
  page?: number;
  pageSize?: number;
  search?: string;
};
