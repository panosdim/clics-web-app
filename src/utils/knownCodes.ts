import { clicsCodesDescType } from "../model";

const knownCodes: clicsCodesDescType[] = [
    { ian: '16-041', activity: '7901', object: '0001', description: 'DOP' },
    { ian: '04-001', activity: '9007', object: '0007', description: 'Annual Leave' },
    { ian: '04-001', activity: '9008', object: '0008', description: 'Sick Leave' },
    { ian: '04-001', activity: '9010', object: '0010', description: 'Bank Holiday' },
    { ian: '04-001', activity: '9011', object: '0011', description: 'Paid Leave of Absence' },
]

export function findDescription(ian: string, activity: string, object: string): string {
    const desc = knownCodes.find(code => code.ian === ian && code.activity === activity && code.object === object)?.description
    return desc || 'Unknown';
}

