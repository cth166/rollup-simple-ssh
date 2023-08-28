import type { Plugin, NormalizedOutputOptions } from 'rollup'
import { NodeSSH } from 'node-ssh'
import path from 'node:path'

interface ServerConfig {
  host: string
  username: string
  password: string
  remotePath: string
}


function ssh(config: ServerConfig): Plugin {
  const ssh = new NodeSSH()
  const { host, username, password, remotePath } = config

  return {
    name: 'rollup-simple-ssh',
    async writeBundle(options) {
      const localPath = normalizeOutDir(options)
      try {
        await conn_server(ssh, host, username, password)
        await clean_dir(ssh, remotePath)
        await upload_dir(ssh, localPath, remotePath)
        console.log('\x1b[1m\x1b[36m%s\x1b[0m', 'ssh upload successfully √ (rollup-simple-ssh)');
      } catch (error) {
        console.log('\x1b[1m\x1b[31m', 'something went wrong (rollup-simple-ssh)', '\x1b[0m');
      } finally {
        ssh.dispose()
      }
    }
  }
}

function normalizeOutDir(options: NormalizedOutputOptions) {
  if (options.dir) {
    return options.dir
  }
  if (options.file) {
    return path.dirname(options.file)
  }
  return './dist'
}

async function conn_server(
  ssh: NodeSSH,
  host: ServerConfig['host'],
  username: ServerConfig['username'],
  password: ServerConfig['password']
) {
  try {
    await ssh.connect({
      host,
      username,
      password
    })
  } catch (error) {
    errorLog('connect server error');
    throw error;
  }
}

async function clean_dir(ssh: NodeSSH, remotePath: ServerConfig['remotePath']) {
  const command = `rm -rf ${remotePath}`
  try {
    await ssh.execCommand(command)
  } catch (error) {
    errorLog('remove previous dir error')
    throw error;
  }
}

async function upload_dir(ssh: NodeSSH, localPath: string, remotePath: ServerConfig['remotePath']) {
  try {
    await ssh.putDirectory(localPath, remotePath)
  } catch (error) {
    errorLog('upload static source error')
    throw error;
  }
}

function errorLog(msg: string) {
  console.log('\x1b[1m\x1b[31m', msg + '(rollup-simple-ssh)', '\x1b[0m');
}

export default ssh
