import { createServer } from 'http';
import { createRouter, Response } from 'fets';
import { Args } from '@e2e/args';

const args = Args(process.argv);

let todos = [];

const app = createRouter()
  .route({
    path: '/todos',
    method: 'GET',
    handler: () => Response.json(todos),
  })
  .route({
    path: '/todo',
    method: 'POST',
    async handler(request) {
      const reqBody = await request.json();
      const todo = {
        id: todos.length,
        ...reqBody,
      };
      todos.push(todo);
      await fetch(`http://0.0.0.0:${args.getPort(true)}/webhooks/todo_added`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(todo),
      })
        .then(res =>
          res.text().then(resText =>
            console.log('Webhook payload sent', {
              status: res.status,
              statusText: res.statusText,
              body: resText,
              headers: Object.fromEntries(res.headers.entries()),
            }),
          ),
        )
        .catch(err => console.error('Webhook payload failed', err));
      return Response.json(todo);
    },
  });

const port = args.getServicePort('api', true);

createServer(app).listen(port, () => {
  console.log(`API service listening on http://localhost:${port}`);
});
