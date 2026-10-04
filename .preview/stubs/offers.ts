const offers = [
  { id: "11111111-1111-4111-8111-111111111111", title: "DevOps Engineer", company: "Smals", language: "fr" },
  { id: "22222222-2222-4222-8222-222222222222", title: "Développeur Front-End (Angular / TypeScript)", company: "Select", language: "fr" },
  { id: "33333333-3333-4333-8333-333333333333", title: "Junior C++ Developer", company: "Genesis Consult", language: "en" },
];
export const listOffers = async () => offers;
export const getOffer = async (_u: string, id: string) => offers.find((o) => o.id === id) ?? null;
