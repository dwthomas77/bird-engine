import { buildApp } from './app.js';

async function start() {
  const app = await buildApp();
  console.log("𓅪 𓅪  Starting Bird Engine, Brrrrrr cheep cheep cheepz 𓅪 𓅪 𓅪");
  try {
    await app.listen({
      port: Number(process.env.PORT ?? 3000),
      host: '0.0.0.0',
    });
    
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

start();
