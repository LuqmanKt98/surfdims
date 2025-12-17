

export interface Region {
    name: string;
}

export interface Country {
    name: string;
    code: string;
    currency: string;
    symbol: string;
    regions: Region[];
    newBoardFee: number;
}

const allCountries: Country[] = [
    {
        name: 'Australia',
        code: 'AU',
        currency: 'AUD',
        symbol: 'A$',
        newBoardFee: 10,
        regions: [
            { name: 'New South Wales' },
            { name: 'Victoria' },
            { name: 'Queensland' },
            { name: 'Western Australia' },
            { name: 'South Australia' },
            { name: 'Tasmania' },
        ]
    },
    { name: 'Brazil', code: 'BR', currency: 'USD', symbol: '$', newBoardFee: 5, regions: [] },
    { name: 'Chile', code: 'CL', currency: 'USD', symbol: '$', newBoardFee: 5, regions: [] },
    { name: 'Costa Rica', code: 'CR', currency: 'USD', symbol: '$', newBoardFee: 5, regions: [] },
    { name: 'El Salvador', code: 'SV', currency: 'USD', symbol: '$', newBoardFee: 5, regions: [] },
    { name: 'France', code: 'FR', currency: 'EUR', symbol: '€', newBoardFee: 5, regions: [] },
    { name: 'Guatemala', code: 'GT', currency: 'USD', symbol: '$', newBoardFee: 5, regions: [] },
    { name: 'Hawaii', code: 'HI', currency: 'USD', symbol: '$', newBoardFee: 5, regions: [] },
    { name: 'Indonesia', code: 'ID', currency: 'USD', symbol: '$', newBoardFee: 5, regions: [] },
    { name: 'Ireland', code: 'IE', currency: 'EUR', symbol: '€', newBoardFee: 5, regions: [] },
    { name: 'Japan', code: 'JP', currency: 'USD', symbol: '$', newBoardFee: 5, regions: [] },
    { name: 'Mexico', code: 'MX', currency: 'USD', symbol: '$', newBoardFee: 5, regions: [] },
    { name: 'Morocco', code: 'MA', currency: 'USD', symbol: '$', newBoardFee: 5, regions: [] },
    {
        name: 'New Zealand',
        code: 'NZ',
        currency: 'NZD',
        symbol: 'NZ$',
        newBoardFee: 10,
        regions: [
            { name: 'Auckland' },
            { name: 'Bay of Plenty' },
            { name: 'Canterbury' },
            { name: 'Gisborne' },
            { name: "Hawke's Bay" },
            { name: 'Manawatū-Wanganui' },
            { name: 'Marlborough' },
            { name: 'Nelson' },
            { name: 'Northland' },
            { name: 'Otago' },
            { name: 'Southland' },
            { name: 'Taranaki' },
            { name: 'Tasman' },
            { name: 'Waikato' },
            { name: 'Wellington' },
            { name: 'West Coast' },
        ]
    },
    { name: 'Nicaragua', code: 'NI', currency: 'USD', symbol: '$', newBoardFee: 5, regions: [] },
    {
        name: 'Pakistan',
        code: 'PK',
        currency: 'PKR',
        symbol: 'Rs',
        newBoardFee: 10,
        regions: [
            { name: 'Islamabad' },
            { name: 'Karachi' },
            { name: 'Lahore' },
            { name: 'Rawalpindi' },
            { name: 'Faisalabad' },
            { name: 'Multan' },
            { name: 'Peshawar' },
            { name: 'Quetta' },
            { name: 'Gujranwala' },
            { name: 'Sialkot' },
            { name: 'Hyderabad' },
            { name: 'Abbottabad' },
        ]
    },
    { name: 'Peru', code: 'PE', currency: 'USD', symbol: '$', newBoardFee: 5, regions: [] },
    { name: 'Portugal', code: 'PT', currency: 'EUR', symbol: '€', newBoardFee: 5, regions: [] },
    { name: 'South Africa', code: 'ZA', currency: 'USD', symbol: '$', newBoardFee: 5, regions: [] },
    { name: 'Spain', code: 'ES', currency: 'EUR', symbol: '€', newBoardFee: 5, regions: [] },
    { name: 'Tahiti (French Polynesia)', code: 'PF', currency: 'USD', symbol: '$', newBoardFee: 5, regions: [] },
    { name: 'United Kingdom', code: 'GB', currency: 'EUR', symbol: '€', newBoardFee: 5, regions: [] },
    {
        name: 'United States',
        code: 'US',
        currency: 'USD',
        symbol: '$',
        newBoardFee: 5,
        regions: [
            { name: 'Alabama' }, { name: 'Alaska' }, { name: 'Arizona' }, { name: 'Arkansas' }, { name: 'California' },
            { name: 'Colorado' }, { name: 'Connecticut' }, { name: 'Delaware' }, { name: 'Florida' }, { name: 'Georgia' },
            { name: 'Hawaii' }, { name: 'Idaho' }, { name: 'Illinois' }, { name: 'Indiana' }, { name: 'Iowa' },
            { name: 'Kansas' }, { name: 'Kentucky' }, { name: 'Louisiana' }, { name: 'Maine' }, { name: 'Maryland' },
            { name: 'Massachusetts' }, { name: 'Michigan' }, { name: 'Minnesota' }, { name: 'Mississippi' }, { name: 'Missouri' },
            { name: 'Montana' }, { name: 'Nebraska' }, { name: 'Nevada' }, { name: 'New Hampshire' }, { name: 'New Jersey' },
            { name: 'New Mexico' }, { name: 'New York' }, { name: 'North Carolina' }, { name: 'North Dakota' }, { name: 'Ohio' },
            { name: 'Oklahoma' }, { name: 'Oregon' }, { name: 'Pennsylvania' }, { name: 'Rhode Island' }, { name: 'South Carolina' },
            { name: 'South Dakota' }, { name: 'Tennessee' }, { name: 'Texas' }, { name: 'Utah' }, { name: 'Vermont' },
            { name: 'Virginia' }, { name: 'Washington' }, { name: 'West Virginia' }, { name: 'Wisconsin' }, { name: 'Wyoming' }
        ]
    },
];

allCountries.sort((a, b) => a.name.localeCompare(b.name));

export const COUNTRIES: Country[] = allCountries;


export const getCurrencySymbol = (countryCode?: string): string => {
    if (!countryCode) return '$';
    const country = COUNTRIES.find(c => c.code === countryCode);
    return country ? country.symbol : '$';
};

export const getNewBoardFee = (countryCode?: string): number => {
    if (!countryCode) return 5;
    const country = COUNTRIES.find(c => c.code === countryCode);
    return country ? country.newBoardFee : 5;
};

export const getCountryName = (countryCode: string): string => {
    const country = COUNTRIES.find(c => c.code === countryCode);
    return country ? country.name : countryCode;
};