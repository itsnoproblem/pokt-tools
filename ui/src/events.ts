export const EVENT_HAMBURGER_OPEN = 'A0FFYPU4';
export const EVENT_HAMBURGER_CLOSE = 'JVNWOI3C';
export const EVENT_ADDRESS_CHOOSER_OPEN = 'RKWDKJXN';
export const EVENT_ADDRESS_CHOOSER_CLOSE = 'FESX0049';
export const EVENT_ADDRESS_CHOOSER_CHOOSE = 'J1G9P3X7';
export const EVENT_ADDRESS_CHOOSER_FAVORITE = 'B2EVIUIX';
export const EVENT_ADDRESS_CHOOSER_UNFAVORITE = 'FIZQRJOT';
export const EVENT_MONTH_OPEN='IEBWNPLL';
export const EVENT_MONTH_CLOSE='VJVXC7FD';
export const EVENT_MONTH_TRANSACTIONS = 'HGSCZJOI';
export const EVENT_MONTH_METRICS = '4GHGNFZZ';
export const EVENT_TOGGLE_LIFETIME_AVG = 'CEOMNLN0';
export const EVENT_TOGGLE_PENDING_UNITS = '0IVHB1EO';

export const trackGoal = (eventCode: string) => {
    // @ts-ignore
    window.fathom.trackGoal(eventCode, 0);
}