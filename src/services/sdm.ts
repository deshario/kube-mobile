import { runCommand } from '../utils/exec.js';

export interface SDMStatus {
  connected: boolean;
  resources: string[];
  error?: string;
  needsLogin?: boolean;
}

export async function getSDMStatus(): Promise<SDMStatus> {
  try {
    const { stdout, stderr } = await runCommand('sdm status');

    if (stderr && stderr.includes('not logged in')) {
      return {
        connected: false,
        resources: [],
        error: 'Not logged in to SDM',
        needsLogin: true,
      };
    }

    const lines = stdout.split('\n').filter(line => line.trim());
    const resources: string[] = [];
    let connected = false;

    for (const line of lines) {
      if (line.toLowerCase().includes('connected') ||
          line.toLowerCase().includes('ready') ||
          line.toLowerCase().includes('listening')) {
        connected = true;
        const parts = line.split(/\s+/);
        if (parts.length > 0) {
          resources.push(parts[0]);
        }
      }
    }

    return {
      connected: connected || resources.length > 0,
      resources,
    };
  } catch (error: any) {
    return {
      connected: false,
      resources: [],
      error: error.message || 'Failed to get SDM status',
    };
  }
}

export async function reconnectSDM(): Promise<{ success: boolean; message: string }> {
  try {
    const status = await getSDMStatus();

    if (status.needsLogin) {
      return {
        success: false,
        message: 'SDM requires login. Please run "sdm login" on your Mac.',
      };
    }

    if (status.connected) {
      return {
        success: true,
        message: 'SDM is already connected.',
      };
    }

    await runCommand('sdm restart');

    // Wait a moment and check status
    await new Promise(resolve => setTimeout(resolve, 2000));

    const newStatus = await getSDMStatus();

    if (newStatus.connected) {
      return {
        success: true,
        message: 'SDM reconnected successfully.',
      };
    }

    return {
      success: false,
      message: 'Failed to reconnect. Try running "sdm login" on your Mac.',
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to reconnect SDM',
    };
  }
}
