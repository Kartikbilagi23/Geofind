
import { gql } from "@apollo/client";

export const MY_SAVED_PLACES = gql`
  query MySavedPlaces {
    mySavedPlaces {
      id
      createdAt
      place {
        id
        name
        description
        category
        city
        address
        latitude
        longitude
        averageRating
      }
    }
  }
`;

export const SAVE_PLACE = gql`
  mutation SavePlace($placeId: Int!) {
    savePlace(placeId: $placeId) {
      id
      createdAt
      place {
        id
        name
        city
      }
    }
  }
`;

export const REMOVE_SAVED_PLACE = gql`
  mutation RemoveSavedPlace($placeId: Int!) {
    removeSavedPlace(placeId: $placeId)
  }
`;
