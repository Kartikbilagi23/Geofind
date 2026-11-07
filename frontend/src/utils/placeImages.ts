
import apollo from "../assets/apollo pharmacy.avif";
import beans from "../assets/beans and brews.jpg";
import burgerKing from "../assets/burger king.avif";
import grand from "../assets/grand.jpg";
import hdfc from "../assets/hdfc.avif";
import healthPlus from "../assets/health plus.jpg";
import ironForge from "../assets/iron forge.jpeg";
import mocha from "../assets/mocha.jpeg";
import rubyCare from "../assets/ruby care.webp";
import spiceGarden from "../assets/spice garden.jpg";
import urbanTandoor from "../assets/urban tandoor.jpg";
import vaishali from "../assets/vaishali.jpg";

const placeImages: Record<string, string> = {
  "apollo pharmacy": apollo,
  "beans and brews": beans,
  "burger king": burgerKing,
  "grand": grand,
  "hdfc": hdfc,
  "health plus": healthPlus,
  "iron forge": ironForge,
  "mocha": mocha,
  "ruby care": rubyCare,
  "spice garden": spiceGarden,
  "urban tandoor": urbanTandoor,
  "vaishali": vaishali,
};

const categoryImages: Record<string, string> = {
  RESTAURANT: spiceGarden,
  CAFE: mocha,
  HOSPITAL: rubyCare,
  GYM: ironForge,
  ATM: hdfc,
  PHARMACY: apollo,
  HOTEL: grand,
};

export function getPlaceImage(name?: string, category?: string) {
  const normalizedName = name?.trim().toLowerCase();

  return (
    (normalizedName && placeImages[normalizedName]) ||
    (category && categoryImages[category.toUpperCase()]) ||
    vaishali
  );
}
