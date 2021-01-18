export const config = {
  db: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT,
  },
  aws: {
    region: process.env.AWS_REGION,
    profile: process.env.AWS_PROFILE,
    media_bucket: process.env.AWS_MEDIA_BUCKET,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
  },
}
