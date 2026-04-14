import { parsePhoneNumberFromString } from 'libphonenumber-js';
import metadata from 'libphonenumber-js/metadata.min.json';
import { countryPhonePatterns } from './country';

export const validationNumber = (value) => {

    const phoneNumberObj = value && parsePhoneNumberFromString(value);
        if (!phoneNumberObj || !phoneNumberObj.isValid()) {
            return false
        }
        const phoneNumber = phoneNumberObj.number;
        const countryCode = phoneNumberObj.country;
        const patternObj = countryPhonePatterns[countryCode];
        if (patternObj && !patternObj.pattern.test(phoneNumber)) {
          return false;
        }
        return true;
};

