export interface JwtUserPayload {
  name: string;
  email: string;
  sub: string;
  iat: number;
  exp: number;
}
