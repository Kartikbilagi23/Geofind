import prisma from "../../lib/prisma.js";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import {
  searchCounter, cacheCounter, cacheMissCounter,
  kafkaMessagesCounter,
  reqlatency
} from "../libs/promethus.js"
import { haversine } from "../../utils/haversine.js"
import producer from "../libs/producer.js";
import ngeohash from "ngeohash";
import redis from "../libs/redis.js";

const refreshPlaceRating = async (tx, placeId) => {
  const aggregate = await tx.review.aggregate({
    where: { placeId },
    _avg: { rating: true },
    _count: { _all: true }
  })
  return tx.place.update({
    where: { id: placeId },
    data: {
      averageRating: aggregate._avg.rating ?? 0,
      reviewCount: aggregate._count._all
    }
  })
}


export const resolvers = {
  Place: {
    createdBy: (parent) => {
      return prisma.user.findUnique({
        where: {
          id: parent.createdById
        }
      });
    }
  },
  Review: {
    user: (parent) => {
      return prisma.user.findUnique({
        where: {
          id: parent.userId
        }
      })
    },
    place: (parent) => {
      return prisma.place.findUnique({
        where: { id: parent.userId }
      })
    }
  },
  Query: {
    route: async (_, args, context) => {
      if (!context.user) {
        throw new Error("UNAUTHENTICATED");
      }

      const { origin, destination } = args;

      // Validate coordinates
      const validCoordinate = (point) => {
        return (
          Number.isFinite(point.latitude) &&
          Number.isFinite(point.longitude) &&
          point.latitude >= -90 &&
          point.latitude <= 90 &&
          point.longitude >= -180 &&
          point.longitude <= 180
        );
      };

      if (
        !validCoordinate(origin) ||
        !validCoordinate(destination)
      ) {
        throw new Error("Invalid coordinates");
      }

      if (
        origin.latitude === destination.latitude &&
        origin.longitude === destination.longitude
      ) {
        throw new Error("Origin and destination cannot be the same");
      }

      try {
        // OSRM expects longitude first, then latitude
        const url =
          `https://router.project-osrm.org/route/v1/driving/` +
          `${origin.longitude},${origin.latitude};` +
          `${destination.longitude},${destination.latitude}` +
          `?overview=full&geometries=geojson&alternatives=true&steps=false`;

        const response = await fetch(url, {
          signal: AbortSignal.timeout(10000),
        });

        if (!response.ok) {
          throw new Error("Routing service unavailable");
        }

        const result = await response.json();

        if (result.code !== "Ok" || !result.routes?.length) {
          throw new Error("No route found");
        }

        return {
          routes: result.routes.map((route) => ({
            distanceKm: route.distance / 1000,
            durationMinutes: route.duration / 60,

            // OSRM returns [longitude, latitude].
            // Leaflet will receive latitude, longitude.
            // OSRM returns coordinates as [longitude, latitude], while React Leaflet expects [latitude, longitude]. We're converting them in the resolver to avoid coordinate-order bugs in the frontend.
            geometry: route.geometry.coordinates.map(
              ([longitude, latitude]) => ({
                latitude,
                longitude,
              })
            ),
          })),
        };
      } catch (error) {
        console.error("Route calculation failed:", error.message);
        throw new Error(
          error.name === "TimeoutError"
            ? "Routing request timed out"
            : "Unable to calculate route"
        );
      }
    },
    mySavedPlaces: async (_, __, context) => {
      if (!context.user) {
        throw new Error("UNAUTHENTICATED");
      }
      return prisma.savedPlace.findMany({
        where: {
          userId: context.user.userId,
        },
        include: {
          place: true
        },
        orderBy: {
          createdAt: "desc",
        }
      })
    },
    nearbyPlaces: async (_, args, context) => {
      if (!context.user) {
        throw new Error("UNAUTHENTICATED");
      }
      searchCounter.inc();
      const end = reqlatency.startTimer();
      try {
        const { latitude, longitude, radius, query, category } = args;
        //suppose user searched pizza ..redis se nearby:18.5204:73.8567:5
        //  ↓
        // pizza results
        //if user searched cafe...redis sees the same key and gives you the pizza results isliye ->nearby:18.5204:73.8567:5:pizza
        const cacheKey = `nearby:${latitude}:${longitude}:${radius}:${category || "all"}`;
        const cached = await redis.get(cacheKey);
        if (cached) {
          console.log("cache hit");
          cacheCounter.inc();
          const nearby = JSON.parse(cached);
          const filtered = query ? nearby.filter(place =>
            place.name.toLowerCase().includes(query.toLowerCase()) ||
            place.category.toLowerCase().includes(query.toLowerCase()) ||
            place.city.toLowerCase().includes(query.toLowerCase())
          ) : nearby;
          return filtered;
        }
        console.log('Cache Miss')
        cacheMissCounter.inc();
        const userhash = ngeohash.encode(
          latitude, longitude, 6
        );
        // await redis.set("test","hello");
        // const val=await redis.get("test");

        // console.log(val)
        const neigh = ngeohash.neighbors(userhash);
        const hashes = [
          userhash, ...neigh
        ]
        // console.log("User hash",userhash);
        // console.log("Search Hashes",hashes);
        //for e.g. (optimization)
        //       DB
        //  ↓
        // WHERE geohash IN (9 cells)
        //  ↓
        // ONLY CANDIDATES
        //  ↓
        // Haversine
        // User hash tek92e
        // Search Hashes [
        //   'tek92e', 'tek92s',
        //   'tek92u', 'tek92g',
        //   'tek92f', 'tek92d',
        //   'tek926', 'tek927',
        //   'tek92k'
        // ]
        const places = await prisma.place.findMany({
          where: {
            geohash: {
              in: hashes
            },
            ...(category && {
              category: category
            })
          }
        });
        const nearby = places
          .map(place => {

            const distance = haversine(
              latitude,
              longitude,
              place.latitude,
              place.longitude
            );

            return {
              ...place,
              distance
            };

          })
          .filter(place => place.distance <= radius)
          .sort((a, b) => a.distance - b.distance);

        await redis.set(cacheKey, JSON.stringify(nearby),
          {
            EX: 60
          }
        )

        const filtered = query ? nearby.filter(place =>
          place.name.toLowerCase().includes(query.toLowerCase()) ||
          place.category.toLowerCase().includes(query.toLowerCase()) ||
          place.city.toLowerCase().includes(query.toLowerCase())
        ) : nearby;

        await producer.send({
          topic: "search-events",
          messages: [
            {
              value: JSON.stringify({
                userId: context.user.userId,
                latitude,
                longitude,
                radius,
                category,
                result: filtered.length,
                searchedAt: new Date()
              })
            }
          ]
        })
        kafkaMessagesCounter.inc();
        return filtered;
      }
      finally {
        end();
      }
    },
    me: async (_, __, context) => {

      if (!context.user)
        throw new Error("Unauthorized");

      return prisma.user.findUnique({
        where: {
          id: context.user.userId
        }
      });

    },
    places: async (_, args, context) => {
      if (!context.user)
        throw new Error('Unauthorized');

      return prisma.place.findMany({
        include: {
          createdBy: true
        }
      });
    },
    place: async (_, args, context) => {
      if (!context.user)
        throw new Error('Unauthorized');

      return prisma.place.findUnique({
        where: {
          id: args.id
        }
      });
    },
    reviews: async (_, args, context) => {
      if (!context.user) {
        throw new Error("UNAUTHENTICATED");
      }
      const placeId = Number(args.placeId);
      if (!Number.isInteger(placeId) || placeId <= 0) {
        throw new Error("Invalid place ID");
      }
      return prisma.review.findMany({
        where: {
          placeId
        },
        orderBy: { createdAt: "desc" }
      })
    },
    myReview: async (_, args, context) => {
      if (!context.user) {
        throw new Error("UNAUTHENTICATED");
      }
      const placeId = Number(args.placeId);
      if (!Number.isInteger(placeId) || placeId <= 0) {
        throw new Error("Invalid placeId");
      }
      return prisma.review.findUnique({
        where: {
          userId_placeId: {
            userId: context.user.userId,
            placeId
          }
        }
      })
    }
  },
  //what is 6? =precision
  //   Precision 3->India-sized area Precision 5->City Precision 6->Neighbourhood Precision 8->
  // Street
  Mutation: {
    addReview: async (_, args, context) => {
      if (!context.user) {
        throw new Error("UNAUTHENTICATED");
      }

      const userId = context.user.userId;
      const placeId = Number(args.placeId);
      const rating = Number(args.rating);
      const comment = args.comment.trim();

      if (!Number.isInteger(placeId) || placeId <= 0) {
        throw new Error("Invalid place ID");
      }

      if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
        throw new Error("Rating must be between 1 and 5");
      }

      if (!comment || comment.length > 1000) {
        throw new Error("Comment must be between 1 and 1000 characters");
      }

      return prisma.$transaction(async (tx) => {
        const place = await tx.place.findUnique({
          where: { id: placeId },
          select: { id: true }
        });

        if (!place) {
          throw new Error("Place not found");
        }

        const review = await tx.review.upsert({
          where: {
            userId_placeId: {
              userId,
              placeId
            }
          },
          update: {
            rating,
            comment
          },
          create: {
            userId,
            placeId,
            rating,
            comment
          }
        });

        await refreshPlaceRating(tx, placeId);

        return review;
      }, {
        maxWait: 10000,
        timeout: 20000
      });
    },
    deleteReview: async (_, args, context) => {
      if (!context.user) {
        throw new Error("UNAUTHENTICATED");
      }

      const reviewId = Number(args.reviewId);

      if (!Number.isInteger(reviewId) || reviewId <= 0) {
        throw new Error("Invalid review ID");
      }

      return prisma.$transaction(async (tx) => {
        const review = await tx.review.findFirst({
          where: {
            id: reviewId,
            userId: context.user.userId
          }
        });

        if (!review) {
          return false;
        }

        await tx.review.delete({
          where: { id: reviewId }
        });

        await refreshPlaceRating(tx, review.placeId);

        return true;
      }, {
        maxWait: 10000,
        timeout: 20000
      });
    },
    seedPlaces: async (_, args, context) => {
      if (!context.user) {
        throw new Error("UNAUTHENTICATED");
      }
      const result = [];
      for (const place of args.places) {
        const existing = await prisma.place.findFirst({
          where: {
            name: place.name,
            city: place.city,
            category: place.category
          }
        });
        if (existing) {
          console.log("already exists:", place.name);
          continue;
        }
        const geohash = ngeohash.encode(
          place.latitude,
          place.longitude,
          6
        );
        const created = await prisma.place.create({
          data: {
            ...place,
            geohash,
            createdBy: {
              connect: { id: context.user.userId }
            }
          }
        });
        result.push(created);
      }
      return result;
    },
    savePlace: async (_, args, context) => {
      if (!context.user) {
        throw new Error("UNAUTHENTICATED");
      }
      const userId = context.user.userId;
      const placeId = args.placeId;
      const place = await prisma.place.findUnique({
        where: {
          id: placeId
        },
        select: { id: true }
      });
      if (!place) {
        throw new Error("Place not found");
      }
      return prisma.savedPlace.upsert({
        where: {
          userId_placeId: {
            userId,
            placeId
          }
        },
        update: {},
        create: {
          userId,
          placeId
        },
        include: {
          place: true
        }
      });
    },
    removeSavedPlace: async (_, args, context) => {
      if (!context.user) {
        throw new Error("UNAUTHENTICATED");
      }
      const result = await prisma.savedPlace.deleteMany({
        where: {
          userId: context.user.userId,
          placeId: args.placeId,
        },
      })
      return result.count > 0;
    },



    //name,descrip,lat,long,address,city,country,category
    addPlace: async (_parent, args, context) => {
      if (!context.user) {
        throw new Error("UNAUTHENTICATED")
      }
      try {
        const geohash = ngeohash.encode(
          args.place.latitude, args.place.longitude, 6
        );
        const place = await prisma.place.create({
          data: {
            ...args.place, geohash,
            createdBy: { connect: { id: context.user.userId } }
          }
        })
        return place;
      } catch (error) {
        throw error;
      }
    },
    updatePlace: async (_parent, args, context) => {
      if (!context.user) {
        throw new Error("UNAUTHENTICATED");
      }

      const existing = await prisma.place.findUnique({
        where: {
          id: args.id,
        },
      });

      if (!existing) {
        throw new Error("Place not found");
      }

      if (existing.createdById !== context.user.userId) {
        throw new Error("FORBIDDEN");
      }
      const geohash = ngeohash.encode(
        args.place.latitude,
        args.place.longitude,
        6
      );
      const place = await prisma.place.update({
        where: {
          id: args.id,
        },
        data: {
          ...args.place,
          geohash
        },
      });

      return place;
    },
    deletePlace: async (_parent, args, context) => {
      if (!context.user) {
        throw new Error("UNAUTHENTICATED");
      }
      try {
        const existing = await prisma.place.findUnique({
          where: { id: args.id }
        })
        if (!existing) {
          throw new Error("Place not found");
        }
        if (existing.createdById !== context.user.userId) {
          throw new Error("FORBIDDEN");
        }
        await prisma.place.delete({
          where: {
            id: args.id
          }
        })
        return true;
      } catch (error) {
        throw error;
      }
    },
    register: async (_parent, args) => {
      try {
        const existing = await prisma.user.findUnique({ where: { email: args.user.email } });
        if (existing) {
          throw new Error("User already exists");
        }
        const hashpass = await bcrypt.hash(args.user.password, 10);
        const user = await prisma.user.create({
          data: {
            name: args.user.name,
            email: args.user.email,
            password: hashpass
          }
        });
        const token = jwt.sign(
          { userId: user.id, email: user.email },
          process.env.JWT_SECRET,
          { expiresIn: '7d' }
        )
        return { token, user }
      } catch (error) {
        console.log(error.message)
        throw error;
      }

    },
    login: async (_parent, args) => {
      try {
        const user = await prisma.user.findUnique({ where: { email: args.user.email } });
        if (!user) {
          throw new Error('Invalid credentials');
        }
        const isvalid = await bcrypt.compare(args.user.password, user.password);
        if (!isvalid) {
          throw new Error('Invalid credentials');
        }
        const token = jwt.sign(
          { userId: user.id, email: user.email },
          process.env.JWT_SECRET,
          { expiresIn: '7d' }
        )
        return { token, user }
      } catch (error) {
        console.log("ERROR MESSAGE:", error.message);
        console.log("ERROR CODE:", error.code);
        console.log("ERROR META:", error.meta);
        console.log("ERROR FULL:", error);
      }
    }
  }
};