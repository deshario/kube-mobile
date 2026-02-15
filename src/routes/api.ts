import { FastifyInstance } from 'fastify';
import { getSDMStatus, reconnectSDM } from '../services/sdm.js';
import { getPods, getContexts, switchContext, getCurrentContext } from '../services/kubectl.js';

export async function apiRoutes(fastify: FastifyInstance) {
  fastify.get('/api/sdm/status', async (request, reply) => {
    try {
      const status = await getSDMStatus();
      return status;
    } catch (error: any) {
      reply.status(500).send({ connected: false, error: error.message });
    }
  });

  fastify.post('/api/sdm/reconnect', async (request, reply) => {
    try {
      const result = await reconnectSDM();
      return result;
    } catch (error: any) {
      reply.status(500).send({ success: false, message: error.message });
    }
  });

  fastify.get('/api/contexts', async () => {
    const [contexts, current] = await Promise.all([
      getContexts(),
      getCurrentContext(),
    ]);
    return {
      contexts,
      current: contexts.find(c => c.context === current)?.id || null,
    };
  });

  fastify.post<{
    Body: { contextId: string };
  }>('/api/contexts/switch', async (request, reply) => {
    try {
      const { contextId } = request.body;
      const result = await switchContext(contextId);
      if (!result.success) {
        reply.status(400).send({ error: result.error });
        return;
      }
      const contexts = await getContexts();
      const ctx = contexts.find(c => c.id === contextId);
      return { success: true, namespace: ctx?.namespace };
    } catch (error: any) {
      reply.status(500).send({ error: error.message });
    }
  });

  fastify.get<{
    Querystring: { namespace: string; search?: string };
  }>('/api/pods', async (request, reply) => {
    try {
      const { namespace, search } = request.query;
      if (!namespace) {
        reply.status(400).send({ error: 'Namespace required', pods: [] });
        return;
      }
      const pods = await getPods(namespace, search);
      return { pods };
    } catch (error: any) {
      reply.status(500).send({ error: error.message, pods: [] });
    }
  });
}
