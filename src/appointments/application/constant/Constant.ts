export const COUNTRY_ISO = {
    CHILE: 'CL',
    PERU: 'PE'
} as const;

export type CountryISO = typeof COUNTRY_ISO[keyof typeof COUNTRY_ISO];

export const getTopicArn = (countryISO: CountryISO) => {
    switch (countryISO) {
        case COUNTRY_ISO.CHILE:
            return process.env.CL_TOPIC_ARN || '';
        case COUNTRY_ISO.PERU:
            return process.env.PE_TOPIC_ARN || '';
    }
}