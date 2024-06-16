
# Resource Builder

Crep's internal resource builder, This is still in the version 0 so it is still being planned but basically the role for this application is to take in a project directory as an input and make itself maleable enough to run the specified resource whether it be running any server or even running any database instance or any queue


## Usage/Examples

```typescript
import Project from "./core/project";

async function main() {
  const resourcePath = process.env.RESOURCE_PATH || "./example/simple_server";
  const result = await Project.readDirectory(resourcePath);
  result.runResource();
}

main();

```


## Documentation

### `ServerResource` 
`ServerResource` class takes in an object which contains all the named logic required for the resource it is of type `Record<string, Logic>` and it will assign all the logic to it's instance

* `register_config` method in the server class is responsible for parsing the configuration passed into any internal type (if) necessary

* `parse_routes` method is basically responsible for getting all the routes from the configuration and building the routes in the main server instance accordingly i.e. if there is any nested router it will make sure to parse that and build the route as required or if there are any route parameters given it will make sure to parse that as well

* `run` this method is responsible for running the server resource