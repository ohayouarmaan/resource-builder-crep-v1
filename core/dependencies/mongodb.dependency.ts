import mongoose from "mongoose";
import Dependency from "../dependency";

interface IMongoDBConfig {
    host: string;
    port: string;
    username: string;
    password: string;
    db_name: string;
}

export default class MongodbDependency extends Dependency<IMongoDBConfig, mongoose.Connection> {
    constructor(config: IMongoDBConfig, id: string, comment?: string) {
        super({
            type: "mongodb",
            comment: comment,
            config,
            id,
        });
    }

    async connect() {
        this.create_core(async (_x): Promise<mongoose.Connection> => {
            try{
                const db  = await mongoose.connect(`mongodb://${this.config.username}:${this.config.password}@${this.config.host}:${this.config.port}/${this.config.db_name}`);
                return db.connection;
            } catch(e) {
                console.error(e);
                throw new Error((e as Error).message);
            }
        });
    }

    async get_collection(collection_name: string) {
        if(this.core) {
            return this.core.collections[collection_name];
        } else {
            await this.connect();
            // using the not null constraint here because we are connecting above and the core should be filled with the required details.
            return this.core!.collections[collection_name];
        }
    }
}