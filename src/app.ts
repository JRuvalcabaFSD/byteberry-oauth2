import { ExpressServer } from '@presentation';
import { container } from '@shared';

(async () => {
  await main();
})();

async function main() {
  const server = ExpressServer.createExpressServer(container);
  try {
    await server.start();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[fatal] Unable to start HTTP server', error);
    process.exit(1);
  }
}
