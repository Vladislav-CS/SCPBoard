import { pathToFileURL } from "node:url";

export async function defaultDynamicImport(path: string): Promise<any> {
    return (await import(pathToFileURL(path).toString()))?.default;
}

export async function dynamicImport(path: string): Promise<any> {
    return (await import(pathToFileURL(path).toString()));
}