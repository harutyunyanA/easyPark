export type JwtTokenPayload = {
  sub: number;
  email: string;
};

export type AuthUser = {
  userId: number;
  email: string;
};
