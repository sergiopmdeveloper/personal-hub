import type { AppLoadContext, EntryContext } from '@remix-run/node';
import { createReadableStreamFromReadable } from '@remix-run/node';
import { RemixServer } from '@remix-run/react';
import { isbot } from 'isbot';
import { PassThrough } from 'node:stream';
import { renderToPipeableStream } from 'react-dom/server';

const ABORT_DELAY = 5_000;

/**
 * Handles incoming requests and routes them to either bot or browser handling
 * @param {Request} request - The incoming request object
 * @param {number} responseStatusCode - The status code for the response
 * @param {Headers} responseHeaders - The headers for the response
 * @param {EntryContext} remixContext - The Remix context object
 * @param {AppLoadContext} _ - The app load context object
 * @returns {Promise<unknown>} - A promise that resolves to a response
 */
export default function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext,
  _: AppLoadContext
): Promise<unknown> {
  return isbot(request.headers.get('user-agent') || '')
    ? handleBotRequest(
        request,
        responseStatusCode,
        responseHeaders,
        remixContext
      )
    : handleBrowserRequest(
        request,
        responseStatusCode,
        responseHeaders,
        remixContext
      );
}

/**
 * Handles requests from bots rendering the full page content before sending
 * @param {Request} request - The incoming request object
 * @param {number} responseStatusCode - The status code for the response
 * @param {Headers} responseHeaders - The headers for the response
 * @param {EntryContext} remixContext - The Remix context object
 * @returns {Promise<unknown>} A promise that resolves to a response
 */
function handleBotRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext
): Promise<unknown> {
  return new Promise((resolve, reject) => {
    let shellRendered = false;

    const { pipe, abort } = renderToPipeableStream(
      <RemixServer
        context={remixContext}
        url={request.url}
        abortDelay={ABORT_DELAY}
      />,
      {
        onAllReady() {
          shellRendered = true;
          const body = new PassThrough();
          const stream = createReadableStreamFromReadable(body);

          responseHeaders.set('Content-Type', 'text/html');

          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode,
            })
          );

          pipe(body);
        },
        onShellError(error: unknown) {
          reject(error);
        },
        onError(error: unknown) {
          responseStatusCode = 500;

          if (shellRendered) {
            console.error(error);
          }
        },
      }
    );

    setTimeout(abort, ABORT_DELAY);
  });
}

/**
 * Handles requests from browsers streaming the response as soon as the shell is ready
 * @param {Request} request - The incoming request object
 * @param {number} responseStatusCode - The status code for the response
 * @param {Headers} responseHeaders - The headers for the response
 * @param {EntryContext} remixContext - The Remix context object
 * @returns {Promise<unknown>} A Promise that resolves to a response
 */
function handleBrowserRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext
): Promise<unknown> {
  return new Promise((resolve, reject) => {
    let shellRendered = false;

    const { pipe, abort } = renderToPipeableStream(
      <RemixServer
        context={remixContext}
        url={request.url}
        abortDelay={ABORT_DELAY}
      />,
      {
        onShellReady() {
          shellRendered = true;
          const body = new PassThrough();
          const stream = createReadableStreamFromReadable(body);

          responseHeaders.set('Content-Type', 'text/html');

          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode,
            })
          );

          pipe(body);
        },
        onShellError(error: unknown) {
          reject(error);
        },
        onError(error: unknown) {
          responseStatusCode = 500;

          if (shellRendered) {
            console.error(error);
          }
        },
      }
    );

    setTimeout(abort, ABORT_DELAY);
  });
}
