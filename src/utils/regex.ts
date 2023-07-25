export function clearTags(text: string): string {
    return text.replace(/<[^>]*?>/g, '');
}

export function removeFrameworkIfExists(text: string): string {
    return text.includes('<color=#00000000><size=1>') ? text.substring(0, text.indexOf('<color=#00000000><size=1>')) : text;
}

export function getFramework(text: string): string {
    return text.includes('<color=#00000000><size=1>') ? clearTags(text.substring(text.indexOf('<color=#00000000><size=1>'))) : 'None';
}