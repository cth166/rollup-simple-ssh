import { NodeSSH } from 'node-ssh';
import path from 'node:path';

/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise, SuppressedError, Symbol */


function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};

function ssh(config) {
    const ssh = new NodeSSH();
    const { host, username, password, remotePath } = config;
    return {
        name: 'rollup-plugin-ssh',
        writeBundle(options) {
            return __awaiter(this, void 0, void 0, function* () {
                const localPath = normalizeOutDir(options);
                yield conn_server(ssh, host, username, password);
                yield clean_dir(ssh, remotePath);
                yield upload_dir(ssh, localPath, remotePath);
                console.log('\x1b[1m\x1b[36m%s\x1b[0m', 'ssh upload successfully √');
                ssh.dispose();
            });
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
function conn_server(ssh, host, username, password) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield ssh.connect({
                host,
                username,
                password
            });
        }
        catch (error) {
            console.log(error, 'connect server error');
        }
    });
}
function clean_dir(ssh, remotePath) {
    return __awaiter(this, void 0, void 0, function* () {
        const command = `rm -rf ${remotePath}`;
        try {
            yield ssh.execCommand(command);
        }
        catch (error) {
            console.log(error, 'remove previous dir error');
        }
    });
}
function upload_dir(ssh, localPath, remotePath) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield ssh.putDirectory(localPath, remotePath);
        }
        catch (error) {
            console.log('upload static source error');
        }
    });
}

export { ssh as default };
