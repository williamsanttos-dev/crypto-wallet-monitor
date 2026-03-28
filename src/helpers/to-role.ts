import { Role } from 'src/enums/role.enum';

export const toRole = (value: string): Role => {
  if (value === 'ADMIN') return Role.ADMIN; // eslint-disable-line
  if (value === 'USER') return Role.USER;

  throw new Error(`Invalid role: ${value}`);
};
