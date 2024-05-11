import config from "./config/config";
import app from "./server";

app.listen(config.port, () => {
  console.log(`Server is running on ${config.port}`);
});
