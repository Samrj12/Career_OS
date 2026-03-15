import { db } from "./index";
import { quotes, users } from "./schema";

const QUOTES = [
  { text: "You have a right to perform your prescribed duties, but you are not entitled to the fruits of your actions.", source: "Bhagavad Gita 2.47" },
  { text: "Let right deeds be thy motive, not the fruit which comes from them.", source: "Bhagavad Gita" },
  { text: "Arise, awake and stop not till the goal is reached.", source: "Swami Vivekananda (echoing Mahabharata)" },
  { text: "The soul is neither born, nor does it die at any time. It has not come into being, does not come into being, and will not come into being. It is unborn, eternal, ever-existing, and primeval.", source: "Bhagavad Gita 2.20" },
  { text: "One who is not disturbed in mind even amidst the threefold miseries or elated when there is happiness, and who is free from attachment, fear, and anger, is called a sage of steady mind.", source: "Bhagavad Gita 2.56" },
  { text: "The mind is restless and difficult to restrain, but it is subdued by practice.", source: "Bhagavad Gita 6.35" },
  { text: "Fear not. What is not real never was and never will be. What is real always was and cannot be destroyed.", source: "Bhagavad Gita 2.16" },
  { text: "When a man dwells in his mind on the objects of sense, attachment to them is produced. From attachment springs desire and from desire comes anger.", source: "Bhagavad Gita 2.62" },
  { text: "Through selfless service, you will always be fruitful and find the fulfillment of your desires.", source: "Bhagavad Gita 3.10" },
  { text: "The wise grieve neither for the living nor for the dead.", source: "Bhagavad Gita 2.11" },
  { text: "Perform your duty and do not waver. There is no better engagement for a man than to fight for the right cause.", source: "Bhagavad Gita 2.31" },
  { text: "He who has no attachments can really love others, for his love is pure and divine.", source: "Bhagavad Gita" },
  { text: "Set thy heart upon thy work, but never upon its reward.", source: "Bhagavad Gita 2.47 (paraphrase)" },
  { text: "Yoga is the journey of the self, through the self, to the self.", source: "Bhagavad Gita 6.20" },
  { text: "A gift is pure when it is given from the heart to the right person at the right time and at the right place, and when we expect nothing in return.", source: "Bhagavad Gita 17.20" },
  { text: "The happiness which comes from long practice, which leads to the end of suffering, which at first is like poison, but at last like nectar — this kind of happiness arises from the serenity of one's own mind.", source: "Bhagavad Gita 18.37" },
  { text: "In battle, in the forest, at the precipice in the mountains, on the dark great sea, in the midst of javelins and arrows, in sleep, in confusion, in the depths of shame — the good deeds a man has done before defend him.", source: "Mahabharata" },
  { text: "Strength does not come from physical capacity. It comes from an indomitable will.", source: "Mahabharata wisdom" },
  { text: "A person can rise through the efforts of his own mind; or draw himself down, in the same manner. Because each person is his own friend or enemy.", source: "Bhagavad Gita 6.5" },
  { text: "The key to happiness is the reduction of desires.", source: "Mahabharata, Shanti Parva" },
  { text: "They alone live who live for others; the rest are more dead than alive.", source: "Mahabharata wisdom" },
  { text: "Before God we are all equally wise — and equally foolish. Act wisely.", source: "Mahabharata" },
  { text: "Speak the truth. Do thy duty. Do not neglect the study of the scriptures. Do not cut the thread of progeny. Swerve not from truth. Deviate not from duty. Neglect not what is beneficial.", source: "Taittiriya Upanishad" },
  { text: "One should not be proud of one's learning. Never desist from the pursuit of the highest knowledge.", source: "Mahabharata, Vana Parva" },
  { text: "Time is the root of all things. The fruit of time matures slowly.", source: "Mahabharata" },
  { text: "There is nothing impossible to him who will try.", source: "Alexander the Great, cited in Mahabharata context" },
  { text: "The greatest obstacle in your path is your own doubting mind.", source: "Mahabharata wisdom" },
  { text: "Even if you are the worst of all sinners, you can cross all evil with the raft of knowledge.", source: "Bhagavad Gita 4.36" },
  { text: "The man who is not disturbed by the incessant flow of desires — that enter like rivers into the ocean — can alone achieve peace.", source: "Bhagavad Gita 2.70" },
  { text: "Whatever action is performed by a great man, common men follow in his footsteps, and whatever standards he sets by exemplary acts, all the world pursues.", source: "Bhagavad Gita 3.21" },
  { text: "Do not be proud of your learning. Take counsel even with the humble.", source: "Mahabharata" },
  { text: "You are what you believe in. You become that which you believe you can become.", source: "Bhagavad Gita wisdom" },
  { text: "Never the spirit was born; the spirit shall cease to be never. Never was time it was not; End and Beginning are dreams.", source: "Bhagavad Gita 2.20 (Arnold translation)" },
  { text: "O Arjuna, only the fortunate warriors get such an opportunity for an unsought war that is like an open door to heaven.", source: "Bhagavad Gita 2.32" },
  { text: "Be selfless. Forge forward with determination. Do not yield.", source: "Bhagavad Gita wisdom" },
  { text: "He who shirks action does not attain freedom; no one can gain perfection by abstaining from work.", source: "Bhagavad Gita 3.4" },
  { text: "All that we are is the result of what we have thought: we are formed and molded by our thoughts.", source: "Dhammapada (complementary wisdom)" },
  { text: "The present moment, devoted to action and devoid of fear, is all there is.", source: "Mahabharata, Bhishma Parva" },
  { text: "By devotion to one's own particular duty, everyone can attain perfection.", source: "Bhagavad Gita 18.45" },
  { text: "Knowledge, the object of knowledge, and the knower are the three factors which motivate action; the senses, the work and the doer comprise the threefold basis of action.", source: "Bhagavad Gita 18.18" },
  { text: "Whatever you do, make it an offering to me — the food you eat, the sacrifices you make, the help you give, even your suffering.", source: "Bhagavad Gita 9.27" },
  { text: "If one offers Me with love and devotion a leaf, a flower, a fruit, or even water, I will accept it.", source: "Bhagavad Gita 9.26" },
  { text: "For one who has conquered the mind, the mind is the best of friends; but for one who has failed to do so, his very mind will be the greatest enemy.", source: "Bhagavad Gita 6.6" },
  { text: "The one who has controlled his mind and senses, and who is desireless, unaffected by pleasure and pain — he alone is fit for immortality.", source: "Bhagavad Gita 2.15" },
  { text: "There is neither this world, nor the world beyond, nor happiness for the one who doubts.", source: "Bhagavad Gita 4.40" },
  { text: "We are kept from our goal not by obstacles but by a clear path to a lesser goal.", source: "Mahabharata wisdom" },
  { text: "Man is made by his belief. As he believes, so he is.", source: "Bhagavad Gita 17.3" },
  { text: "Act, and do not be attached to inaction.", source: "Bhagavad Gita 3.8" },
  { text: "Seek refuge in the attitude of detachment and you will amass the wealth of spiritual awareness. Those who are motivated only by desire for the fruits of action are miserable, for they are constantly anxious about the results of what they do.", source: "Bhagavad Gita 2.49" },
  { text: "On this path effort never goes to waste, and there is no failure. Even a little effort toward spiritual awareness will protect you from the greatest fear.", source: "Bhagavad Gita 2.40" },
];

async function seed() {
  console.log("Seeding database...");

  // Create default user if not exists
  const existing = await db.query.users.findFirst();
  if (!existing) {
    await db.insert(users).values({
      id: crypto.randomUUID(),
      name: "Rudraksh",
      createdAt: Date.now(),
      onboardingComplete: 0,
      preferences: JSON.stringify({
        timezone: "Asia/Kolkata",
        theme: "dark",
        stressTolerance: 7,
        dailyAvailableHours: 6,
      }),
    });
    console.log("Created default user.");
  }

  // Clear existing quotes and re-seed
  await db.delete(quotes);
  for (const q of QUOTES) {
    await db.insert(quotes).values({
      id: crypto.randomUUID(),
      text: q.text,
      source: q.source,
    });
  }
  console.log(`Seeded ${QUOTES.length} quotes.`);
  console.log("Done.");
}

seed().catch(console.error);
