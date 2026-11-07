import restaurant from "../categories/restaurant.jpg";
// import bar from "../categories/bar.jpg"
// import sushi from "../categories/sushi.jpg"
// import cocktails from "../categories/cocktails.jpg"
// import vegan from "../categories/vegan.jpg"
// import pizza from "../categories/pizza.jpg"
// import brunch from "../categories/brunch.jpg"
import cafe from "../categories/cafe.jpg"
import "./Category.css";

type Category = {
  name: string,
  icon?: string,
  image?: string,
  label: string,
  group: string,
}
const categories: Category[] = [
  // Food & Dining
  {
    name: "RESTAURANT",
    label: "Restaurants",
    icon: "🍽️",
    image: restaurant,
    group: "Food & Dining",
  },
  {
    name: "CAFE",
    label: "Cafes",
    icon: "☕",
    image: cafe,
    group: "Food & Dining",
  },

  // Health & Wellness
  {
    name: "HOSPITAL",
    label: "Hospitals",
    icon: "🏥",
    group: "Health & Wellness",
  },
  {
    name: "GYM",
    label: "Gyms",
    icon: "💪",
    group: "Health & Wellness",
  },
  {
    name: "PHARMACY",
    label: "Pharmacies",
    icon: "💊",
    group: "Health & Wellness",
  },

  // Finance & Accommodation
  {
    name: "ATM",
    label: "ATMs",
    icon: "🏧",
    group: "Finance & Accommodation",
  },
  {
    name: "HOTEL",
    label: "Hotels",
    icon: "🏨",
    group: "Finance & Accommodation",
  },

  // Home Services
  {
    name: "CONTRACTOR_HANDYMAN",
    label: "Contractors & Handymen",
    icon: "🔨",
    group: "Home Services",
  },
  {
    name: "PLUMBER",
    label: "Plumbers",
    icon: "🔧",
    group: "Home Services",
  },
  {
    name: "ELECTRICIAN",
    label: "Electricians",
    icon: "⚡",
    group: "Home Services",
  },
  {
    name: "HVAC",
    label: "Heating & Air Conditioning",
    icon: "❄️",
    group: "Home Services",
  },
  {
    name: "APPLIANCE_REPAIR",
    label: "Appliances & Repair",
    icon: "🛠️",
    group: "Home Services",
  },
  {
    name: "ROOFING",
    label: "Roofing",
    icon: "🏠",
    group: "Home Services",
  },
  {
    name: "LOCKSMITH",
    label: "Locksmiths",
    icon: "🔑",
    group: "Home Services",
  },
  {
    name: "PAINTER",
    label: "Painters",
    icon: "🎨",
    group: "Home Services",
  },

  // Garden & Outdoor
  {
    name: "LANDSCAPING",
    label: "Landscaping",
    icon: "🌳",
    group: "Garden & Outdoor",
  },
  {
    name: "NURSERY_GARDENING",
    label: "Nurseries & Gardening",
    icon: "🪴",
    group: "Garden & Outdoor",
  },
  {
    name: "FLORIST",
    label: "Florists",
    icon: "💐",
    group: "Garden & Outdoor",
  },
  {
    name: "TREE_SERVICE",
    label: "Tree Services",
    icon: "🌲",
    group: "Garden & Outdoor",
  },

  // Home & Lifestyle
  {
    name: "HOME_CLEANING",
    label: "Home Cleaning",
    icon: "🧹",
    group: "Home & Lifestyle",
  },
  {
    name: "FURNITURE_STORE",
    label: "Furniture Stores",
    icon: "🛋️",
    group: "Home & Lifestyle",
  },
  {
    name: "MOVER",
    label: "Movers",
    icon: "🚚",
    group: "Home & Lifestyle",
  },
];
type CategorySectionProps = {
  onCategorySelect: (category: string) => void,
  selectedCategory: string | null
}
function CategorySection({
  onCategorySelect,
  selectedCategory
}: CategorySectionProps) {
  const groups = [...new Set(categories.map((category) => category.group))];
  return (
    <section className="category-section">
      <div className="section-header">
        <h2>Browse Categories</h2>

        {selectedCategory && (
          <button
            className="clear-category"
            onClick={() => onCategorySelect(null)}
          >
            Clear ×
          </button>
        )}
      </div>

      <div className="category-grid">
        {categories.map((category) => (
          <button
            key={category.name}
            className={`category-card ${selectedCategory === category.name ? "selected" : ""
              }`}
            onClick={() =>
              onCategorySelect(
                selectedCategory === category.name ? null : category.name
              )
            }
          >
            <span className="category-icon">{category.icon}</span>
            <span className="category-name">
              {category.name.replaceAll("_", " ")}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

export default CategorySection;