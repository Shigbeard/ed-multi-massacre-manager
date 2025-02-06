import React from '@remix-run/react';

export interface MissionData {
    faction: string,
    name: string,
    localisedName: string,
    TargetType: string,
    TargetType_Localised: string,
    TargetFaction: string,
    KillCount: number,
    DestinationSystem: string,
    DestinationStation: string,
    Expiry: string,
    Wing: boolean,
    Reputation: string,
    Reward: number,
    MissionID: number,
    Kills: number,
    CMDR: string,
    Completed: boolean,
}

export interface MissionsProps {
    items: MissionData[];
}

export const Missions: React.FC<MissionsProps> = ({ items }: MissionsProps) => {
    return (
        <div className='relative overflow-x-auto'>
            <table className='w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400'>
                <thead className='text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400'>
                    <tr>
                        <th scope="col" className="px-6 py-3">CMDR</th>
                        <th scope="col" className="px-6 py-3">Destination System</th>
                        <th scope="col" className="px-6 py-3">Destination Station</th>
                        <th scope="col" className="px-6 py-3">Localised Name</th>
                        <th scope="col" className="px-6 py-3">Target Faction</th>
                        <th scope="col" className="px-6 py-3">Kill Count</th>
                        <th scope="col" className="px-6 py-3">Reward</th>
                        <th scope="col" className="px-6 py-3">Expiry</th>
                        <th scope="col" className="px-6 py-3">Completed</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map((item: MissionData) => (
                        <tr key={item.MissionID} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                            <td className="px-6 py-4">{item.CMDR}</td>
                            <td className="px-6 py-4">{item.DestinationSystem}</td>
                            <td className="px-6 py-4">{item.DestinationStation}</td>
                            <td className="px-6 py-4">{item.localisedName}</td>
                            <td className="px-6 py-4">{item.TargetFaction}</td>
                            <td className="px-6 py-4">{item.KillCount}</td>
                            <td className="px-6 py-4">{item.Reward}</td>
                            <td className="px-6 py-4">{item.Expiry}</td>
                            <td className="px-6 py-4">{item.Completed ? 'Yes' : 'No'}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};