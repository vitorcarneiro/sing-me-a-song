import { prisma } from "../src/database.js";

async function main() {
  await prisma.recommendation.createMany({
    data: [
      {
        name: "Falamansa - Xote dos Milagres",
        youtubeLink: "https://www.youtube.com/watch?v=chwyjJbcs1Y",
        score: 952,
      },
      {
        name: "Rick Astley - Never Gonna Give You Up",
        youtubeLink: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        score: 1876,
      },
      {
        name: "PSY - GANGNAM STYLE(강남스타일) M/V",
        youtubeLink: "https://www.youtube.com/watch?v=9bZkp7q19f0",
        score: 257,
      },
      {
        name: "Justin Bieber - Baby (Official Music Video) ft. Ludacris",
        youtubeLink: "https://www.youtube.com/watch?v=kffacxfA7G4",
        score: -1,
      },
    ],
  });
}

main()
  .catch((e) => {
    console.log(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
