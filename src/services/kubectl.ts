import { runCommand, spawnCommand } from '../utils/exec.js';
import { ChildProcess } from 'child_process';

export interface KubeContext {
  id: string;
  name: string;
  context: string;
  namespace: string;
}

export async function getContexts(): Promise<KubeContext[]> {
  const { stdout } = await runCommand(
    'kubectl config get-contexts --no-headers -o name'
  );

  const contextNames = stdout.split('\n').filter(line => line.trim());
  const contexts: KubeContext[] = [];

  for (const contextName of contextNames) {
    const { stdout: ns } = await runCommand(
      `kubectl config view -o jsonpath='{.contexts[?(@.name=="${contextName}")].context.namespace}'`
    );

    contexts.push({
      id: contextName,
      name: contextName,
      context: contextName,
      namespace: ns.trim() || 'default',
    });
  }

  return contexts;
}

export interface Pod {
  namespace: string;
  name: string;
  ready: string;
  status: string;
  restarts: string;
  age: string;
}

export async function switchContext(contextId: string): Promise<{ success: boolean; error?: string }> {
  const contexts = await getContexts();
  const ctx = contexts.find(c => c.id === contextId);
  if (!ctx) {
    return { success: false, error: 'Invalid context' };
  }

  const { stderr } = await runCommand(`kubectl config use-context "${ctx.context}"`);

  if (stderr && stderr.toLowerCase().includes('error')) {
    return { success: false, error: stderr };
  }

  return { success: true };
}

export async function getCurrentContext(): Promise<string> {
  const { stdout } = await runCommand('kubectl config current-context');
  return stdout.trim();
}

export async function getPods(namespace: string, search?: string): Promise<Pod[]> {
  const { stdout, stderr } = await runCommand(
    `kubectl get pods -n ${namespace} --no-headers`
  );

  if (stderr && !stdout) {
    throw new Error(stderr);
  }

  const pods: Pod[] = [];
  const lines = stdout.split('\n').filter(line => line.trim());

  for (const line of lines) {
    const parts = line.trim().split(/\s+/);
    if (parts.length >= 4) {
      const pod: Pod = {
        namespace: namespace,
        name: parts[0],
        ready: parts[1],
        status: parts[2],
        restarts: parts[3],
        age: parts[4] || '',
      };

      if (!search || pod.name.toLowerCase().includes(search.toLowerCase())) {
        pods.push(pod);
      }
    }
  }

  return pods;
}

export function streamLogs(
  namespace: string,
  podName: string,
  onData: (data: string) => void,
  onError: (error: string) => void,
  onClose: () => void
): ChildProcess {
  const proc = spawnCommand('kubectl', [
    'logs',
    '-f',
    '-n',
    namespace,
    podName,
    '--since=2m',
  ]);

  proc.stdout?.on('data', (data: Buffer) => {
    onData(data.toString());
  });

  proc.stderr?.on('data', (data: Buffer) => {
    onError(data.toString());
  });

  proc.on('close', () => {
    onClose();
  });

  proc.on('error', (err) => {
    onError(err.message);
  });

  return proc;
}
