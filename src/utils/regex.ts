export function clearTags(text: string): string {
    return text.replace(/<[^>]*?>/g, '').replaceAll('█', '').trimStart().replace(/\s+/g, ' ');
}

export function removeFrameworkIfExists(text: string): string {
    return text.includes('<color=#00000000><size=1>') ? text.substring(0, text.indexOf('<color=#00000000><size=1>')) : text;
}

export function getFramework(text: string): string {
    const matches = text.match(/[a-zA-Z]+ \d+\.\d+\.\d+/g);
    return matches ? matches[0] : 'None';
}

export function formatDate(date: Date): string {
    return `${("00" + date.getDate()).slice(-2)}.${("00" + (date.getMonth() + 1)).slice(-2)}.${date.getFullYear()}  ${("00" + date.getHours()).slice(-2)}:${("00" + date.getMinutes()).slice(-2)}:${("00" + date.getSeconds()).slice(-2)}`;
}
