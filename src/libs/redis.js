import {createClient} from "redis";
import env from "dotenv";

const redis=createClient({
    url:process.env.REDIS_URL
});

redis.on("err",(err)=>{
    console.log("Redis Error",err);
})
await redis.connect();

export default redis;
