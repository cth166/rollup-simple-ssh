import type { Plugin } from 'rollup';
import type { Config } from 'node-ssh';
interface BaseConfig {
    host: Config['host'];
    username: Config['username'];
    remotePath: string;
}
type PasswordConfig = BaseConfig & {
    password: Config['password'];
};
type KeyConfig = BaseConfig & {
    privateKeyPath: Config['privateKeyPath'];
};
type SSHConfig = PasswordConfig | KeyConfig;
declare function ssh(config: SSHConfig): Plugin;
export default ssh;
