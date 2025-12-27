
import React from 'react';
import { DonationEntry, User } from '../types';
import { getCurrencySymbol } from '../countries';
import DownloadIcon from './icons/DownloadIcon';

interface EntriesManagerProps {
    entries: DonationEntry[];
    users: User[];
}

const EntriesManager: React.FC<EntriesManagerProps> = ({ entries, users }) => {

    const sortedEntries = [...entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const userMap: Map<string, User> = new Map(users.map(u => [u.id, u]));

    const totalEntriesCount = entries.length;
    const totalAmount = entries.reduce((sum, entry) => sum + entry.amount, 0);
    const firstUserForCurrency = entries.length > 0 ? userMap.get(entries[0].userId) : null;
    const currencySymbolForTotal = getCurrencySymbol(firstUserForCurrency?.country);

    const handleDownloadCSV = () => {
        let csvContent = "Name,Email,Country,Amount\n";

        sortedEntries.forEach(entry => {
            const user = userMap.get(entry.userId);
            const name = user ? `"${user.name.replace(/"/g, '""')}"` : 'N/A'; // Handle quotes in names
            const email = entry.userEmail;
            const country = user ? user.country : 'N/A';
            const amount = entry.amount;
            csvContent += `${name},${email},${country},${amount}\n`;
        });

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", "donations.csv");
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };


    if (entries.length === 0) {
        return (
            <div className="text-center py-12 px-6 bg-gray-50 rounded-lg">
                <h2 className="text-2xl font-semibold text-gray-700">No Donations Yet</h2>
                <p className="text-gray-500 mt-2">When users donate, their details will appear here.</p>
            </div>
        );
    }
    
    return (
        <div>
            <div className="mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 p-4 bg-gray-50 rounded-lg border">
                <div className="flex items-center gap-4">
                     <h3 className="text-xl font-semibold text-gray-700">Donations</h3>
                     <button onClick={handleDownloadCSV} className="p-2 text-gray-500 bg-white border rounded-full hover:bg-gray-100 hover:text-gray-700" title="Download as CSV">
                        <DownloadIcon />
                    </button>
                </div>
                <div className="flex gap-6 text-center">
                    <div>
                        <p className="text-sm text-gray-500">Donations</p>
                        <p className="text-xl font-bold text-gray-800">{totalEntriesCount}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Total Collected</p>
                        <p className="text-xl font-bold text-gray-800">{currencySymbolForTotal}{totalAmount.toFixed(2)}</p>
                    </div>
                </div>
            </div>
             <div className="max-h-[55vh] overflow-y-auto">
                <table className="min-w-full bg-white divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Name
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Email
                            </th>
                             <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Country
                            </th>
                            <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Amount
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {sortedEntries.map((entry) => {
                            const user = userMap.get(entry.userId);
                            const currencySymbol = getCurrencySymbol(user?.country);
                            return (
                                <tr key={entry.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {user?.name || 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {entry.userEmail}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {user?.country || 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-semibold text-gray-800">
                                        {currencySymbol}{entry.amount.toFixed(2)}
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default EntriesManager;
