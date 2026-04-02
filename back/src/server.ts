// Entrée principale de l'API Express.
// Rôle: configurer middlewares et monter les routes.
import "dotenv/config";
import { createApp } from "./app.js";

const app = createApp();

const port = Number(process.env.PORT) || 3000;
app.listen(port, () => {
  console.log(`API listening on port ${port}`);
});
