import { NodeSSH } from 'node-ssh';
import path from 'node:path';

function ssh(config) {
    const ssh = new NodeSSH();
    return {
        name: 'rollup-simple-ssh',
        async writeBundle(options) {
            const localDir = normalizeOutDir(options);
            const remoteDir = path.posix.join(config.remotePath, path.basename(localDir));
            try {
                await conn_server(ssh, config);
                await clean_dir(ssh, remoteDir);
                await upload_dir(ssh, localDir, remoteDir);
            }
            catch {
                errorLog('something went wrong');
            }
            finally {
                ssh.dispose();
            }
        }
    };
}
function normalizeOutDir(options) {
    if (options.dir) {
        return options.dir;
    }
    if (options.file) {
        return path.dirname(options.file);
    }
    return './dist';
}
async function conn_server(ssh, config) {
    const opts = {
        host: config.host,
        username: config.username
    };
    if ('password' in config) {
        opts.password = config.password;
    }
    else if ('privateKeyPath' in config) {
        opts.privateKeyPath = config.privateKeyPath;
    }
    try {
        await ssh.connect(opts);
        successLog('connect server');
    }
    catch (error) {
        errorLog('connect server error');
        throw error;
    }
}
async function clean_dir(ssh, remotePath) {
    const command = `rm -rf ${remotePath}`;
    try {
        await ssh.execCommand(command);
        successLog(`cleanup ${remotePath} in server`);
    }
    catch (error) {
        errorLog('cleanup previous dir error');
        throw error;
    }
}
async function upload_dir(ssh, localPath, remotePath) {
    try {
        await ssh.putDirectory(localPath, remotePath, {
            recursive: true,
        });
        successLog('upload successfully');
    }
    catch (error) {
        errorLog('upload static source error');
        throw error;
    }
}
function errorLog(msg) {
    console.log('\x1b[1m\x1b[31m', `× ${msg} (rollup-simple-ssh)`, '\x1b[0m');
}
function successLog(msg) {
    console.log('\x1b[1m\x1b[36m%s\x1b[0m', `√ ${msg} (rollup-simple-ssh)`);
}

export { ssh as default };
