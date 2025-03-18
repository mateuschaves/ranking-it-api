export const jwtConstants = {
    secret: process.env.APP_SECRET,
    expiresIn: process.env.EXPIRES_IN,
    refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET,
    refreshTokenExpiresIn: process.env.EXPIRES_IN,
};
