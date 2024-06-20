import mongoose from "mongoose";
import Dependency from "../dependency";
import InternalDependency from "../internal_dependency";
import { IDependency } from "../../types/core/dependency.types";

interface IMongoDBConfig {
  host: string;
  port: string;
  username: string;
  password: string;
  db_name: string;
}

export default class MongodbDependency extends Dependency<
  IMongoDBConfig,
  mongoose.Connection
> implements InternalDependency {
  constructor(config: IDependency<IMongoDBConfig>, id: string, comment?: string) {
    super({
      type: "mongodb",
      comment: comment,
      config: config.config,
      id,
    });
  }

  override async connect() {
    this.create_core(async (_x): Promise<mongoose.Connection> => {
      try {
        const db = await mongoose.connect(
          `mongodb://${this.config.username}:${this.config.password}@${this.config.host}:${this.config.port}/${this.config.db_name}`,
          {
            serverSelectionTimeoutMS: 3000
          }
        );
        console.log("[DEBUG]: Database Connected.")
        return db.connection;
      } catch (e) {
        console.error(e);
        throw new Error((e as Error).message);
      }
    });
  }

  //TODO: Add multiple helper functions like fetch all documents, fetch a certain document, use filters etc.
  //Example: fetching a certain document from it's specific field should be using filters this.core.collections[collection_name].find(filter)
  //kind of like the above example, not exactly tho
  async get_collection(collection_name: string) {
    if (this.core) {
      const collection = await this.core.db.collection(collection_name);
      return collection;
    } else {
      await this.connect();
      // using the not null constraint here because we are connecting above and the core should be filled with the required details.
      return this.core!.collections[collection_name];
    }
  }

  async fetch_all(collection_name: string) {
    if (this.core) {
      const collection = await this.core.db.collection(collection_name);
      const cursor = await collection.find({});
      const docs = [];
      for await (const doc of cursor) {
        docs.push(doc);
      }
      return docs;
    } else {
      await this.connect();
      // using the not null constraint here because we are connecting above and the core should be filled with the required details.
      const collection = await this.core!.db.collection(collection_name);
      const cursor = await collection.find({});
      const docs = [];
      for await (const doc of cursor) {
        docs.push(doc);
      }
      return docs;
    }
  }
}
