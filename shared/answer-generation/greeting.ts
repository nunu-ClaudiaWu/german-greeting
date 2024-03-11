import {Gender} from "../types";
import getGenderByFirstname from "../ai/classification";
import getContactName from "../ai/questionAnswering";

const GREETING_DEFAULT = 'Sehr geehrte Damen und Herren';
const GREETING_INFORMAL_DEFAULT = 'Guten Tag';
const REG_EXP_WORDS = /[ .:;?!~,`"&|()<>{}\[\]\r\n\\]+/;
const DU_WORDS = ['du', 'dein', 'deine', 'deiner', 'deinen', 'deines', 'deinem', 'dir', 'dich'];
const FORM_OF_ADDRESS_WORDS = Object.values(Gender);
const INFORMAL_GREETINGS = ['hallo', 'liebe', 'guten tag', 'guten morgen', 'guten abend'];

export async function generateGreeting(text: string, statusCallback?: Function) {

    const name = await getContactName(text, statusCallback);
    const {firstname, lastname} = splitName(name);
    const isDu = getIsDu(text);
    const isInformalGreeting = getIsInformalGreeting(text);
    const gender =
        getGenderByHerrOrFrau(lastname, text) ||
        (firstname ? (await getGenderByFirstname(firstname, statusCallback)) : undefined);

    // Hallo Max
    if (isDu && firstname) {
        return greetInformallyWithFirstname(firstname);

        // Hallo Herr Mustermann / Guten Tag Herr Mustermann
    } else if ((isDu || isInformalGreeting) && lastname && gender) {
        return greetInformallyWithLastname(lastname, gender, isDu);

        // Guten Tag Max Mustermann
    } else if ((isDu || isInformalGreeting) && firstname && lastname) {
        return greetInformallyWithFirstnameAndLastname(firstname, lastname);

        // Guten Tag
    } else if (isDu || isInformalGreeting) {
        return GREETING_INFORMAL_DEFAULT;

        // Sehr geehrter Herr Mustermann
    } else if (lastname && gender) {
        return greetFormallyWithLastname(lastname, gender);
    }

    // Sehr geehrte Damen und Herren
    return GREETING_DEFAULT;
}

const splitName = (fullName: string | undefined) => {
    const splitNames = fullName?.split(' ');

    const names: { firstname: string | undefined, lastname: string | undefined } = {
        firstname: undefined,
        lastname: undefined,
    };

    if (splitNames?.length === 1) {
        names.firstname = splitNames[0];

    } else if (splitNames && splitNames.length > 1) {

        const hasLastnameTitle =
            splitNames[splitNames.length - 2][0] === splitNames[splitNames.length - 2][0].toLowerCase();

        if (hasLastnameTitle) {
            names.lastname = [splitNames.pop(), splitNames.pop()].reverse().join(' ');
        } else {
            names.lastname = splitNames.pop();
        }

        if (Object.values(Gender).some(gender => splitNames && splitNames.length > 0 && splitNames[0].includes(gender))) {
            splitNames.shift();
        }
        names.firstname = splitNames.length > 0 && splitNames.join(' ') || undefined;
    }
    return names;
}

const getGenderByHerrOrFrau = (lastname: string | undefined, text: string) => {

    if (lastname === undefined) {
        return undefined;
    }

    const words = text.split(REG_EXP_WORDS);
    const lastnameIndex = words.indexOf(lastname);

    const startIndex = lastnameIndex - 5 >= 0 ? lastnameIndex - 5 : undefined;

    const gender = words
        .slice(startIndex, lastnameIndex)
        .map(word => word as Gender)
        .map(word => FORM_OF_ADDRESS_WORDS.find(formOfAddress => word.includes(formOfAddress)))
        .filter(gender => gender);

    return gender.length === 1 ? gender[0] : undefined;
}

const getIsDu = (text: string) => text
    .toLowerCase()
    .split(REG_EXP_WORDS)
    .some(word => DU_WORDS.includes(word));

const getIsInformalGreeting = (text: string) => INFORMAL_GREETINGS
    .some(greeting => text.toLowerCase().includes(greeting));

const greetFormallyWithLastname = (lastname: string, gender: Gender) =>
    'Sehr geehrte' + (gender === Gender.MALE ? 'r' : '') +
    ' ' + gender + ' ' + lastname;

const greetInformallyWithFirstname = (firstname: string) => 'Hallo ' + firstname;

const greetInformallyWithLastname =
    (lastname: string, gender: Gender | undefined, isDu: boolean) =>
        (isDu ? 'Hallo ' : 'Guten Tag ') + gender + ' ' + lastname;

const greetInformallyWithFirstnameAndLastname = (firstname: string, lastname: string) =>
    'Guten Tag ' + firstname + ' ' + lastname;