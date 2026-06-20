export type BillingRegion="US"|"TR"|"EU"|"GB"|"CA"|"AU";
export const REGION_BY_LOCALE={en:"US",tr:"TR",de:"EU",es:"EU",fr:"EU"} as const;
// Regional metadata is static; monetary values always come from public.plans.
export const REGION_META:Record<BillingRegion,{label:string;currency:string;locale:string}>={US:{label:"United States",currency:"USD",locale:"en-US"},TR:{label:"Türkiye",currency:"TRY",locale:"tr-TR"},EU:{label:"European Union",currency:"EUR",locale:"de-DE"},GB:{label:"United Kingdom",currency:"GBP",locale:"en-GB"},CA:{label:"Canada",currency:"CAD",locale:"en-CA"},AU:{label:"Australia",currency:"AUD",locale:"en-AU"}};
