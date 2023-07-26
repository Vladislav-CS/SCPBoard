import { formatDate } from '../utils/regex.js';
import Chalk from 'chalk';

export function run() {
    const nativeLog = console.log;
    const nativeWarn = console.warn;
    const nativeError = console.error;

    console.log = (data: any, ...args: any[]): void => {
        const date = formatDate(new Date());
        const e = new Error();
        const regex = /[\w-]*\.(\w*):(\d+)(?=:\d+)/;
        const match = regex.exec(e.stack!.split("\n")[2]);
        const file = match !== null ? match![0] : '';
        
        nativeLog(Chalk.hex('#496DCB')(`[${date}]`) + Chalk.hex('#F5C637')(' [LOG]') + Chalk.hex('#FFCE73')(` [${file}]`) + Chalk.hex('#FFFFFF')(` ${data}`));
    }

    console.warn = (data: any, ...args: any[]): void => {
        const date = formatDate(new Date());
        const e = new Error();
        const regex = /[\w-]*\.(\w*):(\d+)(?=:\d+)/;
        const match = regex.exec(e.stack!.split("\n")[2]);
        const file = match !== null ? match![0] : '';

        nativeWarn(Chalk.hex('#496DCB')(`[${date}]`) + Chalk.hex('#FF9900')(' [WARN]') + Chalk.hex('#FFCE73')(` [${file}]`) + Chalk.hex('#FFFFFF')(` ${data}`));
    }

    console.error = (data: any, ...args: any[]): void => {
        const date = formatDate(new Date());
        const e = new Error();
        const regex = /[\w-]*\.(\w*):(\d+)(?=:\d+)/;
        const match = regex.exec(e.stack!.split("\n")[2]);
        const file = match !== null ? match![0] : '';

        nativeError(Chalk.hex('#496DCB')(`[${date}]`) + Chalk.hex('#F53750')(' [ERROR]') + Chalk.hex('#FFCE73')(` [${file}]`) + Chalk.hex('#FFFFFF')(` ${data}`));
    }
};