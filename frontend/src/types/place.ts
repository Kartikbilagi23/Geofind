export type Place={
    id:number,
    name:string,
    description:string,
    latitude:number,
    longitude:number,
    address:string,
    city:string,
    country:string,
    category:string,
    averageRating:number,
    reviewCount:number,
    createdAt:string,
    distance:number | null
}

// model Place {
//   id Int @id @default(autoincrement())
//   name String?
//   description String
//   latitude Float
//   longitude Float
//   address String
//   city String
//   country String
//   geohash String?
//   @@index([geohash])
//   category Category
//   createdById Int
//   createdBy   User @relation(fields: [createdById], references: [id])
//   averageRating Float @default(0)
//   reviews Review[]
//   createdAt DateTime @default(now())
// }