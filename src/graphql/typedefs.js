export const typeDefs = `#graphql
  type User{
  id:Int!
  name:String!
  email:String!
  createdAt: String!
  }
  type Place {
  id:Int!
  name:String!
  description:String!
  latitude:Float!
  longitude:Float!
  address:String!
  city:String!
  country:String!
  category:String!
  averageRating:Float!
  createdAt:String!
  distance:Float
  reviewCount:Int!
  reviews:[Review!]!
  
  createdBy: User!
  }

  type SavedPlace {
  id: Int!
  createdAt: String!
  place: Place!
  }

  input PlaceInput{
  name: String!
  description:String!
  latitude:Float!
  longitude:Float!
  address:String!
  city:String!
  country:String!
  category:String!
  }


  input RegisterInput{
  name:String!
  email: String!
  password:String!  
  }

  input LoginInput{
  email:String!
  password: String!
  }

  input CoordinateInput {
    latitude: Float!
    longitude: Float!
  }
  type Review {
  id: ID!
  rating: Int!
  comment: String!
  createdAt: String!
  updatedAt: String!
  user: User!
  place: Place!
}

  type RoutePoint {
    latitude: Float!
    longitude: Float!
  }

  type RouteOption {
    distanceKm: Float!
    durationMinutes: Float!
    geometry: [RoutePoint!]!
  }

  type RouteResponse {
    routes: [RouteOption!]!
  }

type Query {
  places: [Place!]!
  place(id: Int!): Place
reviews(placeId: Int!): [Review!]!
myReview(placeId: Int!): Review
  
  nearbyPlaces(
    latitude: Float!
    longitude: Float!
    radius: Float!
    category: String
    query: String
    city: String
  ): [Place!]!

  mySavedPlaces: [SavedPlace!]!
  me: User
  route(
    origin: CoordinateInput!
    destination: CoordinateInput!
  ): RouteResponse!
}

type AuthPayload {
  token: String
  user: User
}

type Mutation {
  register(user: RegisterInput!): AuthPayload!
  login(user: LoginInput!): AuthPayload!

  addPlace(place: PlaceInput!): Place!
  updatePlace(id: Int!,place: PlaceInput!): Place!
  deletePlace(id: Int!): Boolean!
addReview(placeId: Int! rating: Int! comment: String!): Review!
deleteReview(reviewId: Int!): Boolean!
  seedPlaces(places:[PlaceInput!]!):[Place!]!
  savePlace(placeId: Int!): SavedPlace!
  removeSavedPlace(placeId: Int!): Boolean!
}

`;