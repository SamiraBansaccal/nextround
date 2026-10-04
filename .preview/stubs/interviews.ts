const d = new Date("2026-10-04T12:00:00Z");
export const listInterviewsWithProgress = async () => [
  { id: "a", offerId: "1", kind: "offer", topic: null, interviewerId: "mr-burns", offerTitle: "DevOps Engineer", company: "Smals", createdAt: d, answered: 3, total: 10 },
  { id: "b", offerId: null, kind: "technology", topic: "tech:docker", interviewerId: "homer-simpson", offerTitle: null, company: null, createdAt: d, answered: 0, total: 8 },
  { id: "c", offerId: null, kind: "hr", topic: null, interviewerId: "marie", offerTitle: null, company: null, createdAt: d, answered: 8, total: 8 },
];
