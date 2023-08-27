import type { Plugin } from 'rollup';
interface ServerConfig {
    host: string;
    username: string;
    password: string;
    remotePath: string;
}
declare function ssh(config: ServerConfig): Plugin;
export default ssh;
