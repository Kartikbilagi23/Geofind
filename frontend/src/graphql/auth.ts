import { gql } from "@apollo/client";

export const LOGIN=gql`
mutation Login($user:LoginInput!){
login(user:$user){
token
user {
id
email
}
}
}
`;