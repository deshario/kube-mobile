import { exec, spawn, ChildProcess } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface ExecResult {
  stdout: string;
  stderr: string;
}

export async function runCommand(command: string): Promise<ExecResult> {
  try {
    const { stdout, stderr } = await execAsync(command, {
      shell: '/bin/zsh',
      env: { ...process.env, PATH: process.env.PATH },
    });
    return { stdout: stdout.trim(), stderr: stderr.trim() };
  } catch (error: any) {
    return {
      stdout: error.stdout?.trim() || '',
      stderr: error.stderr?.trim() || error.message,
    };
  }
}

export function spawnCommand(
  command: string,
  args: string[]
): ChildProcess {
  return spawn(command, args, {
    shell: '/bin/zsh',
    env: { ...process.env, PATH: process.env.PATH },
  });
}
