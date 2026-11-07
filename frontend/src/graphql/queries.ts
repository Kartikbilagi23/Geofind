import {gql} from "@apollo/client";
import type { Place } from "../types/place";

export interface NearbyPlaces{
    id:string,
    name:string,
    address:string,
    distance:number;
}

export const NEARBY_PLACES=gql`
query nearbyPlaces(
$latitude: Float!
$longitude: Float!
$radius: Float!
$category:String
$query:String
){
nearbyPlaces(
latitude:$latitude
longitude:$longitude
radius:$radius
category:$category
query:$query
){
      id
      name
      description
      latitude
      longitude
      address
      city
      country
      category
      averageRating
      reviewCount
      createdAt
      distance
}
}
`;
export const GET_PLACE_DETAILS = gql`
  query GetPlaceDetails($id: Int!) {
    place(id: $id) {
      id
      name
      description
      address
      city
      country
      category
      averageRating
      reviewCount
      createdAt
    }
  }
`;

export const GET_REVIEWS = gql`
  query GetReviews($placeId: Int!) {
    reviews(placeId: $placeId) {
      id
      rating
      comment
      createdAt
      updatedAt
      user {
        id
        name
      }
    }
  }
`;

export const GET_MY_REVIEW = gql`
  query GetMyReview($placeId: Int!) {
    myReview(placeId: $placeId) {
      id
      rating
      comment
      createdAt
      updatedAt
    }
  }
`;

export const ADD_REVIEW = gql`
  mutation AddReview(
    $placeId: Int!
    $rating: Int!
    $comment: String!
  ) {
    addReview(
      placeId: $placeId
      rating: $rating
      comment: $comment
    ) {
      id
      rating
      comment
      createdAt
      updatedAt
    }
  }
`;

export const DELETE_REVIEW = gql`
  mutation DeleteReview($reviewId: Int!) {
    deleteReview(reviewId: $reviewId)
  }
`;





export const GET_ROUTE = gql`
  query GetRoute(
    $origin: CoordinateInput!
    $destination: CoordinateInput!
  ) {
    route(origin: $origin, destination: $destination) {
      routes {
        distanceKm
        durationMinutes
        geometry {
          latitude
          longitude
        }
      }
    }
  }
`;

export const ME=gql`
query Me{
me{
 id name email createdAt

}}
`;

export type NearbyPlacesData={
    nearbyPlaces:Place[]
}



