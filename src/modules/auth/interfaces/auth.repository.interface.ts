export type createPayload = {
  email: string;
  passwordHash: string;
  username: string;
};

export interface IAuthRepository {
  findUserByEmailAndUsername(email: string, username: string): Promise<boolean>;
  create(data: createPayload): Promise<void>;
}
