import {
  advantages,
  brand,
  cases,
  consultation,
  courses,
  hero,
  lead,
  nav,
  offer,
} from "./site";

export type SiteContent = {
  brand: typeof brand;
  nav: typeof nav;
  hero: typeof hero;
  advantages: typeof advantages;
  courses: typeof courses;
  offer: typeof offer;
  cases: typeof cases;
  consultation: typeof consultation;
  lead: typeof lead;
};

export function getSiteContentSnapshot(): SiteContent {
  return structuredClone({
    brand,
    nav,
    hero,
    advantages,
    courses,
    offer,
    cases,
    consultation,
    lead,
  });
}

export function applySiteContent(next: SiteContent) {
  Object.assign(brand, next.brand);
  Object.assign(hero, next.hero);
  Object.assign(offer, next.offer);
  Object.assign(consultation, next.consultation);
  Object.assign(lead, next.lead);

  nav.splice(0, nav.length, ...structuredClone(next.nav));
  advantages.splice(0, advantages.length, ...structuredClone(next.advantages));
  courses.splice(0, courses.length, ...structuredClone(next.courses));
  cases.splice(0, cases.length, ...structuredClone(next.cases));
}
