export function fromBase64(text: string): string {
    return Buffer.from(text, 'base64').toString();
}