import mongoose from "mongoose";

const connectionString = `mongodb+srv://${process.env.MONGO_DB_USERNAME}:${process.env.MONGO_DB_PASSWORD}@dbms.global.mongocluster.cosmos.azure.com/?tls=true&authMechanism=SCRAM-SHA-256&retrywrites=false&maxIdleTimeMS=120000
`;

if (!connectionString) {
    throw new Error ("Please Provide a valid connection string")
}

const connectDB = async () => {
    if (mongoose.connection?.readyState >= 1) {
        return;

    }

    try{
        console.log("------------Connecting to MongoDB ---------------")
        await mongoose.connect(connectionString);

    }catch (error){
        console.log("Error connecting to mongoDB: ", error);
    }
}

export default connectDB;

//mongodb+srv://Kartikeya:<password>@cloud1.global.mongocluster.cosmos.azure.com/?tls=true&authMechanism=SCRAM-SHA-256&retrywrites=false&maxIdleTimeMS=120000
//mongodb+srv://Kartikeya:<password>@cloud1.mongocluster.cosmos.azure.com/?tls=true&authMechanism=SCRAM-SHA-256&retrywrites=false&maxIdleTimeMS=120000

//mongodb+srv://Kartikeya:Munnaqwerty09@dbms.global.mongocluster.cosmos.azure.com/?tls=true&authMechanism=SCRAM-SHA-256&retrywrites=false&maxIdleTimeMS=120000


