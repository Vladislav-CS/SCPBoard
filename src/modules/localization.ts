import { existsSync, mkdirSync, readdirSync, readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { EmbedField } from "discord.js";

const localizationsPath: string = `${dirname(fileURLToPath(import.meta.url))}/../locales`;
const defaultLanguageCode: string = 'en-US';

interface IManifest {
    language_code: string;
    authors: string[];
}

interface ILocalization {
    [key: string]: string;
}

interface ILocale {
    manifest: IManifest;
    keys: ILocalization;
}

export enum TranslationKey {
    None,
    Contribute = 'CONTRIBUTE',
    Contributors = 'CONTRIBUTORS',
    GameInfo = 'GAME_INFO',
    CommunityInfo = 'COMMUNITY_INFO',
    RegionInfo = 'REGION_INFO',
    ServerInfo = 'SERVER_INFO',
    TotalServers = 'TOTAL_SERVERS',
    Players = 'PLAYERS',
    Vanilla = 'VANILLA',
    GreaterServers = 'GREATER_SERVERS',
    LessServers = 'LESS_SERVERS',
    Modded = 'MODDED',
    GreaterCommunities = 'GREATER_COMMUNITIES',
    LessCommunities = 'LESS_COMMUNITIES',
    Whitelisted = 'WHITELISTED',
    FriendlyFire = 'FRIENDLY_FIRE',
    PrivateBeta = 'PRIVATE_BETA',
    CacheUpdated = 'CACHE_UPDATED',
    NoServers = 'NO_SERVERS',
    Leaderboard = 'LEADERBOARD',
    WholeGame = 'WHOLE_GAME',
    NoRecords = 'NO_RECORDS',
    LastRecord = 'LAST_RECORD',
    AccountId = 'ACCOUNT_ID',
    ServerId = 'SERVER_ID',
    Region = 'REGION',
    Geolocation = 'GEOLOCATION',
    Address = 'ADDRESS',
    Port = 'PORT',
    Ports = 'PORTS',
    Framework = 'FRAMEWORK',
    Servers = 'SERVERS',
    Country = 'COUNTRY',
    RegionNotFound = 'REGION_NOT_FOUND',
    ServerNotFound = 'SERVER_NOT_FOUND',
    ScpListLink = 'SCPLIST_LINK',
    PlaceTop = 'PLACE_TOP',
    MaxPlayers = 'MAX_PLAYERS',
    AveragePlayers = 'AVERAGE_PLAYERS',
    PeakPlayers = 'PEAK_PLAYERS',
    InvalidCommunity = 'INVALID_COMMUNITY',
    InvalidServer = 'INVALID_SERVER',
    CacheNotUpdated = 'CACHE_NOT_UPDATED',
    CommandError = 'COMMAND_ERROR'
}

let currentLocales: ILocale[] = [];
let defaultLocale: ILocale;

function validateJsonFile<T extends object>(data: T | null, schema: T): boolean {
    return data !== null && Object.keys(schema).every((key) => (key in data));
}

function readJsonFile<T extends object>(filePath: string): T | undefined {
    try {
        const fileContent = readFileSync(filePath, 'utf-8');
        return JSON.parse(fileContent) as T;
    } catch (e) {
        console.error(e);
        return undefined;
    }
}

export function run() {
    if (!existsSync(localizationsPath)) {
        mkdirSync(localizationsPath, { recursive: true });
    }

    const languageDirs = readdirSync(localizationsPath, { withFileTypes: true })
        .filter((dirent) => dirent.isDirectory())
        .map((dirent) => dirent.name);

    for (const dir of languageDirs) {
        const manifestPath = `${localizationsPath}/${dir}/manifest.json`;
        const localizationPath = `${localizationsPath}/${dir}/localization.json`;

        if (!existsSync(manifestPath) || !existsSync(localizationPath)) {
            console.log(`Files missing in ${dir} language directory`);
            continue;
        }

        const manifest = readJsonFile<IManifest>(manifestPath);
        const localization = readJsonFile<ILocalization>(localizationPath);

        const isManifestValid = validateJsonFile<IManifest>(
            manifest as IManifest,
            { language_code: '', authors: [''] }
        );

        if (!isManifestValid) {
            console.log(`Invalid manifest.json in ${dir} language directory`);
        }

        if (isManifestValid && manifest && localization) {
            currentLocales.push({
                manifest: manifest,
                keys: localization
            });
        }
    }

    defaultLocale = currentLocales.find(l => l.manifest.language_code === defaultLanguageCode) as ILocale;

    if (defaultLocale) {
        console.log(`Found default locale ${defaultLocale.manifest.language_code}.`)
    } else {
        console.log(`Default locale with code ${defaultLanguageCode} is missing. Default translations will be used instead.`);
    }

    console.log(`Successfully loaded ${currentLocales.length} locales.`)
}

export function readLocalizationKey(languageCode: string, key: TranslationKey, defaultTranslation: string = 'NO_TRANSLATION'): string {
    const locale = currentLocales.find(l => l.manifest.language_code === languageCode);

    if (!locale || !(key in locale.keys)) {
        return defaultLocale !== undefined && (key in defaultLocale.keys) ? defaultLocale.keys[key.toString()] : defaultTranslation;
    }

    return locale.keys[key.toString()];
}

export function getContributors(): EmbedField[] {
    const fields: EmbedField[] = [];

    currentLocales.forEach(locale => {
        fields.push({ name: locale.manifest.language_code, value: locale.manifest.authors.join('\n'), inline: false });
    });

    return fields;
}