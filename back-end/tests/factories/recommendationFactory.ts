import { faker } from "@faker-js/faker";

const youtubeLinks = [
  "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  "https://www.youtube.com/watch?v=fNFzfwLM72c",
  "https://www.youtube.com/watch?v=U5TqIdff_DQ",
  "https://www.youtube.com/watch?v=ZZ5LpwO-An4",
  "https://www.youtube.com/watch?v=k85mRPqvMbE",
  "https://www.youtube.com/watch?v=zA52uNzx7Y4",
  "https://www.youtube.com/watch?v=k-HdGnzYdFQ",
];

export function recommendationBodyFactory() {
  return {
    name: `${faker.name.firstName()}'s test song`,
    youtubeLink: youtubeLinks[randomIndex()],
  };
}

export function recommendationDataFactory() {
  return {
    id: 1,
    name: `${faker.name.firstName()}'s test song`,
    youtubeLink: youtubeLinks[randomIndex()],
    score: Math.floor(Math.random() * 9999),
  };
}

export function recommendationDataNoIdFactory() {
  return {
    name: `${faker.name.firstName()}'s test song`,
    youtubeLink: youtubeLinks[randomIndex()],
    score: Math.floor(Math.random() * 9999),
  };
}

const randomIndex = () => {
  return Math.floor(Math.random() * youtubeLinks.length);
};
