// Starts Electron with ELECTRON_RUN_AS_NODE cleared. Some editors (VS Code extensions) set it,
// which makes Electron behave like plain Node and the app never opens.
import { spawn } from 'node:child_process';
import electron from 'electron';

const env = { ...process.env };
delete env.ELECTRON_RUN_AS_NODE;
const child = spawn(electron, process.argv.slice(2), { stdio: 'inherit', env });
child.on('exit', (code) => process.exit(code ?? 0));
