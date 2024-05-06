import exp from "constants";
import jwt from "jsonwebtoken";
export const generateJwtToken = (userId: number): Promise<string> => {
  return new Promise<string>((resolve, reject) => {
    const currentDate = new Date();
    const fiveMinutes = currentDate.setMinutes(currentDate.getMinutes() + 5);
    const payload = {
      sub: userId,
      exp: Math.floor(fiveMinutes / 1000),
    };
    jwt.sign(payload, "ini_secret_kematian", (err, token) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(token as string);
    });
  });
};
