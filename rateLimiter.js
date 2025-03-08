
const express =  require('express')
const Redis =  require('ioredis');

// first install the redis in you system . 


const app = express();
    
const redis =  new Redis();  //  localhost:6379
// const redis = new Redis();
redis.on('error', (err) => {
    console.error('Redis Client Error', err);
});


const RATE_LIMIT = 10;   //  10 time limit request
const TIME_WINDOW =  60; //  for 60 sec

const rateLimiter  = async (req,res,next) => {

      const ip = req.ip;
      const key = `key:${ip}`;
    try{

          // increase the count of the ip addrss of the user and if user came first time 
          // then assign the value to 1. with time out of 60 sec
          const requests = await redis.incr(key);
          
          if(requests  === 1){
                await redis.expire(key,TIME_WINDOW);
            }
            // if request reach the RATE_LIMIT , then block this user for some period of time  .
            if(requests > RATE_LIMIT){
                  return    res.status(429).json({ message: " Too many require , Try after sometime!"})
            }
            next();
      }catch(error){
             console.log(" rate limiter error : " , error)
             res.status(500).json({message : " internal server error"})
      }
      
}


app.use(rateLimiter);


app.get('/',  (req,res) =>{
       res.send("welcome to our page ")
})

app.listen(3000 , ()=>{
      console.log(" server is running on port no : 3000")
})


