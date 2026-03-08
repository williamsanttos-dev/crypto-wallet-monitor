export type JwtPayload = {
  sub: string;
};

export interface ITokenProvider {
  sign(payload: JwtPayload, type: 'access' | 'refresh'): string;
  verify<T>(token: string, type: 'access' | 'refresh'): T;
}
