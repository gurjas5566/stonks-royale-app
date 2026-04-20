const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Stock = require("./models/Stock");
const User = require("./models/user");
const Transaction = require("./models/transaction");

dotenv.config();

const sectors = [
  "Food & Snacks",
  "Entertainment",
  "Technology",
  "Apparel",
  "Space Travel",
  "Companions",
  "Toys",
  "Transportation",
  "Clean Energy",
  "Magic & Spells"
];

const companyData = [
  // Food & Snacks
  { symbol: "CANDY", name: "SugarRush Co.", currentPrice: 15.00 },
  { symbol: "PIZZA", name: "Infinite Pizza", currentPrice: 12.00 },
  { symbol: "CHOC", name: "ChocoMountains", currentPrice: 20.00 },
  { symbol: "GUM", name: "BubblePop Blast", currentPrice: 5.50 },
  { symbol: "ICE", name: "Frosty Delights", currentPrice: 10.00 },
  { symbol: "JUICE", name: "Solar Sips", currentPrice: 8.00 },
  { symbol: "CRISP", name: "Crunchy Bites", currentPrice: 6.50 },
  { symbol: "BERRY", name: "Berry Good Farms", currentPrice: 22.00 },
  { symbol: "MELON", name: "Mega Watermelons", currentPrice: 18.00 },
  { symbol: "TACO", name: "Taco Tuesday Inc.", currentPrice: 14.50 },

  // Entertainment
  { symbol: "TOY", name: "BlockBuilders Inc.", currentPrice: 25.00 },
  { symbol: "GAME", name: "Pixel Play", currentPrice: 45.00 },
  { symbol: "TUBE", name: "MeTube Videos", currentPrice: 60.00 },
  { symbol: "TICK", name: "TokTik Dance", currentPrice: 30.00 },
  { symbol: "FILM", name: "HoloMovies", currentPrice: 50.00 },
  { symbol: "SONG", name: "GrooveTunes", currentPrice: 38.00 },
  { symbol: "BOOK", name: "Magic Pages", currentPrice: 12.00 },
  { symbol: "PARK", name: "Rollercoaster Tycoons", currentPrice: 110.00 },
  { symbol: "SHOW", name: "Stage Lights", currentPrice: 18.50 },
  { symbol: "ART", name: "Paint Splash", currentPrice: 22.00 },

  // Technology
  { symbol: "ZAP", name: "Zap Electronics", currentPrice: 40.00 },
  { symbol: "BOT", name: "RoboHelpers", currentPrice: 85.00 },
  { symbol: "CYBER", name: "CyberCore", currentPrice: 120.00 },
  { symbol: "HACK", name: "Code Ninjas", currentPrice: 55.00 },
  { symbol: "WIFI", name: "UltraConnect", currentPrice: 70.00 },
  { symbol: "CHIP", name: "Silicon Micro", currentPrice: 90.00 },
  { symbol: "DRONE", name: "SkyCam Tech", currentPrice: 65.00 },
  { symbol: "CLOUD", name: "SkyStorage", currentPrice: 80.00 },
  { symbol: "VR", name: "Virtual Reality Co.", currentPrice: 115.00 },
  { symbol: "AI", name: "BrainMinds AI", currentPrice: 150.00 },

  // Apparel
  { symbol: "SNEAK", name: "HoverKicks", currentPrice: 50.00 },
  { symbol: "CAPS", name: "Cool Hats Ltd.", currentPrice: 15.00 },
  { symbol: "DRIP", name: "Drip Streetwear", currentPrice: 80.00 },
  { symbol: "GEAR", name: "TechApparel", currentPrice: 42.00 },
  { symbol: "SOCK", name: "Rocket Socks", currentPrice: 8.00 },
  { symbol: "FIT", name: "Neon Activewear", currentPrice: 35.00 },
  { symbol: "SHOE", name: "SpringShoes", currentPrice: 48.00 },
  { symbol: "ZIP", name: "ZipUp Jackets", currentPrice: 60.00 },
  { symbol: "GLOVE", name: "Power Gloves", currentPrice: 25.00 },
  { symbol: "SUIT", name: "Space Suits", currentPrice: 250.00 },

  // Space Travel
  { symbol: "MARS", name: "Mars Colonists", currentPrice: 300.00 },
  { symbol: "GALAXY", name: "Galaxy Tours", currentPrice: 150.00 },
  { symbol: "ROCKET", name: "Rocket Dynamics", currentPrice: 220.00 },
  { symbol: "STAR", name: "Starships Inc.", currentPrice: 180.00 },
  { symbol: "ORBIT", name: "Orbit Escapes", currentPrice: 95.00 },
  { symbol: "MOON", name: "Lunar Base", currentPrice: 120.00 },
  { symbol: "ALIEN", name: "Alien Contacts", currentPrice: 500.00 },
  { symbol: "ASTRO", name: "Astro Mining", currentPrice: 140.00 },
  { symbol: "COMET", name: "Comet Catchers", currentPrice: 75.00 },
  { symbol: "NOVA", name: "SuperNova Energy", currentPrice: 190.00 },

  // Companions
  { symbol: "PETS", name: "RoboPets Ltd.", currentPrice: 35.00 },
  { symbol: "DOGE", name: "CyberDog", currentPrice: 45.00 },
  { symbol: "FLUFF", name: "Fluffy Monsters", currentPrice: 28.00 },
  { symbol: "DINO", name: "Jurassic Clones", currentPrice: 120.00 },
  { symbol: "MEOW", name: "Jetpack Cats", currentPrice: 42.00 },
  { symbol: "FISH", name: "HoloAquarium", currentPrice: 18.00 },
  { symbol: "BIRD", name: "Drone Birds", currentPrice: 25.00 },
  { symbol: "PANDA", name: "KungFu Pandas", currentPrice: 65.00 },
  { symbol: "BEAR", name: "Teddy Defenders", currentPrice: 30.00 },
  { symbol: "DRAGON", name: "FireBreathers Inc", currentPrice: 150.00 },

  // Toys
  { symbol: "SLIME", name: "MegaSlime Labs", currentPrice: 8.00 },
  { symbol: "NERF", name: "Blaster Corp", currentPrice: 22.00 },
  { symbol: "DOLL", name: "Action Heroes", currentPrice: 15.00 },
  { symbol: "PUZ", name: "Brain Puzzles", currentPrice: 12.00 },
  { symbol: "SPIN", name: "Fidget Spinners", currentPrice: 5.00 },
  { symbol: "CARD", name: "Battle Cards", currentPrice: 18.00 },
  { symbol: "PLUSH", name: "Squishy Mallows", currentPrice: 25.00 },
  { symbol: "BRICK", name: "Lego Builders", currentPrice: 45.00 },
  { symbol: "KITE", name: "Aero Kites", currentPrice: 9.00 },
  { symbol: "YOYO", name: "YoYo Masters", currentPrice: 6.00 },

  // Transportation
  { symbol: "WHEELS", name: "TurboBikes", currentPrice: 80.00 },
  { symbol: "BOARD", name: "HoverBoards", currentPrice: 120.00 },
  { symbol: "SHIP", name: "Pirate Ships", currentPrice: 200.00 },
  { symbol: "TRAIN", name: "Hyperloop", currentPrice: 150.00 },
  { symbol: "JET", name: "JetPacks R Us", currentPrice: 300.00 },
  { symbol: "CART", name: "GoKarts Pro", currentPrice: 45.00 },
  { symbol: "SUB", name: "Deep Sea Subs", currentPrice: 90.00 },
  { symbol: "TAXI", name: "Flying Taxis", currentPrice: 65.00 },
  { symbol: "BUS", name: "Magic School Bus", currentPrice: 35.00 },
  { symbol: "SKATE", name: "Rocket Skates", currentPrice: 55.00 },

  // Clean Energy
  { symbol: "SUN", name: "Solar Flare", currentPrice: 40.00 },
  { symbol: "WIND", name: "Tornado Turbines", currentPrice: 35.00 },
  { symbol: "WATER", name: "Wave Power", currentPrice: 25.00 },
  { symbol: "ATOM", name: "Neon Fusion", currentPrice: 80.00 },
  { symbol: "TREE", name: "Nature Tech", currentPrice: 15.00 },
  { symbol: "LEAF", name: "Green Earth", currentPrice: 12.00 },
  { symbol: "BAT", name: "SuperBatteries", currentPrice: 55.00 },
  { symbol: "RECY", name: "Recycle Bots", currentPrice: 20.00 },
  { symbol: "HYDRO", name: "Hydro Cars", currentPrice: 45.00 },
  { symbol: "EARTH", name: "Planet Savers", currentPrice: 60.00 },

  // Magic & Spells
  { symbol: "MAGIC", name: "Wizard Wands", currentPrice: 75.00 },
  { symbol: "SPELL", name: "Potion Labs", currentPrice: 40.00 },
  { symbol: "WIZ", name: "SpellBooks", currentPrice: 25.00 },
  { symbol: "BROOM", name: "Flying Brooms", currentPrice: 90.00 },
  { symbol: "WAND", name: "Elder Wands", currentPrice: 150.00 },
  { symbol: "CURSE", name: "Dark Arts Defense", currentPrice: 60.00 },
  { symbol: "CRYST", name: "Crystal Balls", currentPrice: 35.00 },
  { symbol: "ALCH", name: "Alchemy Gold", currentPrice: 200.00 },
  { symbol: "MAGE", name: "Mage Guild", currentPrice: 110.00 },
  { symbol: "AURA", name: "Aura Protectors", currentPrice: 50.00 }
];

// Add the sectors recursively to the data and generate initial history
let finalCompanies = [];
for (let i = 0; i < 10; i++) {
  const currentSector = sectors[i];
  const sectorGroup = companyData.slice(i * 10, i * 10 + 10);
  sectorGroup.forEach(c => {
    c.sector = currentSector;
    // Generate 20 points of history based on initial price
    const history = [];
    let tempPrice = c.currentPrice;
    for(let j=0; j<20; j++) {
      const change = (Math.random() * 0.1 - 0.05); // -5% to +5%
      tempPrice = tempPrice * (1 + change);
      history.push(Number(tempPrice.toFixed(2)));
    }
    c.priceHistory = history;
  });
  finalCompanies = [...finalCompanies, ...sectorGroup];
}

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB...");

    console.log("Wiping existing market data to prevent ghost shares...");
    await Stock.deleteMany({});
    await User.deleteMany({});
    await Transaction.deleteMany({});

    console.log(`Injecting ${finalCompanies.length} Gamified Companies...`);
    await Stock.insertMany(finalCompanies);

    console.log("Database Seeded Successfully! You can now start the node server.");
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedDB();
