import { Role } from 'src/enums/role.enum';

export class UserEntity {
  id!: string;
  email!: string;
  username!: string;
  role!: Role;
  createdAt!: Date;
  updatedAt!: Date;
}
