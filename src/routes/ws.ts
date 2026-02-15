import { FastifyInstance } from 'fastify';
import { ChildProcess } from 'child_process';
import { streamLogs } from '../services/kubectl.js';

interface LogMessage {
  action: 'start' | 'stop';
  namespace?: string;
  pod?: string;
}

export async function wsRoutes(fastify: FastifyInstance) {
  fastify.get('/ws/logs', { websocket: true }, (socket, req) => {
    let currentProcess: ChildProcess | null = null;

    const cleanup = () => {
      if (currentProcess) {
        currentProcess.kill();
        currentProcess = null;
      }
    };

    socket.on('message', (rawMessage: Buffer) => {
      try {
        const message: LogMessage = JSON.parse(rawMessage.toString());

        if (message.action === 'start') {
          // Stop any existing stream
          cleanup();

          if (!message.namespace || !message.pod) {
            socket.send(JSON.stringify({
              type: 'error',
              message: 'Missing namespace or pod name',
            }));
            return;
          }

          currentProcess = streamLogs(
            message.namespace,
            message.pod,
            (data) => {
              socket.send(JSON.stringify({
                type: 'log',
                data,
              }));
            },
            (error) => {
              socket.send(JSON.stringify({
                type: 'error',
                message: error,
              }));
            },
            () => {
              socket.send(JSON.stringify({
                type: 'closed',
                message: 'Log stream ended',
              }));
              currentProcess = null;
            }
          );

          socket.send(JSON.stringify({
            type: 'started',
            message: `Streaming logs for ${message.namespace}/${message.pod}`,
          }));
        } else if (message.action === 'stop') {
          cleanup();
          socket.send(JSON.stringify({
            type: 'stopped',
            message: 'Log stream stopped',
          }));
        }
      } catch (error: any) {
        socket.send(JSON.stringify({
          type: 'error',
          message: `Invalid message: ${error.message}`,
        }));
      }
    });

    socket.on('close', () => {
      cleanup();
    });

    socket.on('error', () => {
      cleanup();
    });
  });
}
