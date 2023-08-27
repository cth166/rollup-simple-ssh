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
    name: 'rollup-plugin-ssh',
    async writeBundle(options) {
      const localPath = normalizeOutDir(options)
      await conn_server(ssh, host, username, password)
      await clean_dir(ssh, remotePath)
      await upload_dir(ssh, localPath, remotePath)
      console.log('\x1b[1m\x1b[36m%s\x1b[0m', 'ssh upload successfully √');
      ssh.dispose()
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
    console.log(error, 'connect server error');
  }
}

async function clean_dir(ssh: NodeSSH, remotePath: ServerConfig['remotePath']) {
  const command = `rm -rf ${remotePath}`
  try {
    await ssh.execCommand(command)
  } catch (error) {
    console.log(error, 'remove previous dir error');
  }
}

async function upload_dir(ssh: NodeSSH, localPath: string, remotePath: ServerConfig['remotePath']) {
  try {
    await ssh.putDirectory(localPath, remotePath)
  } catch (error) {
    console.log('upload static source error');
  }
}

export default ssh
